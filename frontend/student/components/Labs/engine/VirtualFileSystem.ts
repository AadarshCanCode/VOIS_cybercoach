export interface FileSystemNode {
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: { [key: string]: FileSystemNode };
    permissions: string;
    owner: string;
    group: string;
    size: number;
    modified: Date;
}

export class VirtualFileSystem {
    private root: FileSystemNode;
    private currentPath: string[];

    constructor() {
        this.root = {
            name: '/',
            type: 'directory',
            children: {
                'home': {
                    name: 'home',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'operator': {
                            name: 'operator',
                            type: 'directory',
                            permissions: 'drwxr-xr-x',
                            owner: 'operator',
                            group: 'operator',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'notes.txt': {
                                    name: 'notes.txt',
                                    type: 'file',
                                    content: 'Mission Objective: Infiltrate the target system and retrieve the admin credentials.',
                                    permissions: '-rw-r--r--',
                                    owner: 'operator',
                                    group: 'operator',
                                    size: 84,
                                    modified: new Date()
                                },
                                'tools': {
                                    name: 'tools',
                                    type: 'directory',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'operator',
                                    group: 'operator',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'bin': {
                    name: 'bin',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'etc': {
                    name: 'etc',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'passwd': {
                            name: 'passwd',
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:operator:/home/operator:/bin/bash',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            size: 102,
                            modified: new Date()
                        }
                    }
                }
            },
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date()
        };
        this.currentPath = ['home', 'operator'];
    }

    public getCurrentPath(): string {
        return '/' + this.currentPath.join('/');
    }

    public resolvePath(path: string): FileSystemNode | null {
        if (path === '/') return this.root;

        const parts = path.startsWith('/')
            ? path.split('/').filter(p => p)
            : [...this.currentPath, ...path.split('/').filter(p => p)];

        let current = this.root;

        // Handle relative paths like ..
        const resolvedParts: string[] = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                resolvedParts.pop();
            } else {
                resolvedParts.push(part);
            }
        }

        for (const part of resolvedParts) {
            if (current.type !== 'directory' || !current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    }

    public listDirectory(path: string = '.'): FileSystemNode[] {
        const node = this.resolvePath(path);
        if (!node || node.type !== 'directory' || !node.children) {
            throw new Error(`ls: cannot access '${path}': No such file or directory`);
        }
        return Object.values(node.children);
    }

    public changeDirectory(path: string): void {
        const node = this.resolvePath(path);
        if (!node) {
            throw new Error(`cd: ${path}: No such file or directory`);
        }
        if (node.type !== 'directory') {
            throw new Error(`cd: ${path}: Not a directory`);
        }

        // Update current path based on resolved node
        // This is a simplification; a real FS would track the path properly
        if (path.startsWith('/')) {
            this.currentPath = path.split('/').filter(p => p);
        } else {
            const parts = path.split('/').filter(p => p);
            for (const part of parts) {
                if (part === '..') {
                    this.currentPath.pop();
                } else if (part !== '.') {
                    this.currentPath.push(part);
                }
            }
        }
    }

    public readFile(path: string): string {
        const node = this.resolvePath(path);
        if (!node) {
            throw new Error(`cat: ${path}: No such file or directory`);
        }
        if (node.type === 'directory') {
            throw new Error(`cat: ${path}: Is a directory`);
        }
        return node.content || '';
    }

    public writeFile(path: string, content: string): void {
        const parts = path.split('/');
        const fileName = parts.pop();
        const dirPath = parts.join('/');

        const dirNode = this.resolvePath(dirPath || '.');
        if (!dirNode || dirNode.type !== 'directory' || !dirNode.children || !fileName) {
            throw new Error(`touch: cannot touch '${path}': No such file or directory`);
        }

        dirNode.children[fileName] = {
            name: fileName,
            type: 'file',
            content,
            permissions: '-rw-r--r--',
            owner: 'operator',
            group: 'operator',
            size: content.length,
            modified: new Date()
        };
    }
}
