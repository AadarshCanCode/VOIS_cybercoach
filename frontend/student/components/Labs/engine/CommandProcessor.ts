import { VirtualFileSystem } from './VirtualFileSystem';
import { NetworkSimulator } from './NetworkSimulator';

export interface CommandResult {
    output: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export class CommandProcessor {
    private fs: VirtualFileSystem;
    private net: NetworkSimulator;
    private commandHistory: string[] = [];
    private historyIndex: number = -1;

    constructor() {
        this.fs = new VirtualFileSystem();
        this.net = new NetworkSimulator();
    }

    public async execute(commandLine: string): Promise<CommandResult> {
        const parts = commandLine.trim().split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        if (!cmd) return { output: '', type: 'info' };

        this.commandHistory.push(commandLine);
        this.historyIndex = this.commandHistory.length;

        try {
            switch (cmd) {
                case 'help':
                    return {
                        output: `
Available Commands:
  System:
    ls [path]       List directory contents
    cd <path>       Change directory
    pwd             Print working directory
    cat <file>      Read file content
    touch <file>    Create empty file
    clear           Clear terminal screen
    whoami          Display current user

  Network & Recon:
    nmap <target>   Network exploration and port scanner
    curl <url>      Transfer data from URL
    
  Exploitation:
    sqlmap -u <url> Automate SQL injection detection and exploitation
    hydra           Parallelized login cracker
            `,
                        type: 'info'
                    };

                case 'ls': {
                    const files = this.fs.listDirectory(args[0] || '.');
                    const output = files.map(f => {
                        const color = f.type === 'directory' ? '\x1b[34m' : '\x1b[37m'; // Blue for dir, White for file
                        return `${f.permissions} ${f.owner} ${f.group} ${f.size.toString().padStart(6)} ${f.modified.toLocaleTimeString()} ${color}${f.name}\x1b[0m`;
                    }).join('\n');
                    return { output, type: 'success' };
                }

                case 'cd':
                    this.fs.changeDirectory(args[0] || '~');
                    return { output: '', type: 'success' };

                case 'pwd':
                    return { output: this.fs.getCurrentPath(), type: 'success' };

                case 'cat':
                    if (!args[0]) throw new Error('cat: missing file operand');
                    return { output: this.fs.readFile(args[0]), type: 'success' };

                case 'touch':
                    if (!args[0]) throw new Error('touch: missing file operand');
                    this.fs.writeFile(args[0], '');
                    return { output: '', type: 'success' };

                case 'whoami':
                    return { output: 'operator', type: 'success' };

                case 'nmap': {
                    if (!args[0]) return { output: 'nmap: missing target specification', type: 'error' };
                    const scanResult = this.net.scan(args[0]);
                    if (scanResult.error) return { output: `Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn\nNmap done: 1 IP address (0 hosts up) scanned in 3.02 seconds`, type: 'error' };

                    let nmapOutput = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
                    nmapOutput += `Nmap scan report for ${args[0]} (${scanResult.ip})\n`;
                    nmapOutput += `Host is up (0.0024s latency).\n`;
                    nmapOutput += `Not shown: 998 closed tcp ports (reset)\n`;
                    nmapOutput += `PORT     STATE SERVICE\n`;
                    scanResult.ports.forEach((p: any) => {
                        nmapOutput += `${p.port}/tcp ${p.state.padEnd(5)} ${p.service}\n`;
                    });
                    nmapOutput += `\nNmap done: 1 IP address (1 host up) scanned in 1.45 seconds`;
                    return { output: nmapOutput, type: 'success' };
                }

                case 'curl': {
                    if (!args[0]) return { output: 'curl: try \'curl --help\' for more information', type: 'error' };
                    const response = await this.net.fetch(args[0]);
                    return { output: response.data, type: 'success' };
                }

                case 'sqlmap': {
                    if (!args.includes('-u')) return { output: 'sqlmap: missing url parameter (-u)', type: 'error' };
                    const urlIndex = args.indexOf('-u') + 1;
                    const url = args[urlIndex];
                    if (!url) return { output: 'sqlmap: missing url', type: 'error' };

                    return {
                        output: `
        ___
       __H__
 ___ ___[']_____ ___ ___  {1.5.11#stable}
|_ -| . ["]     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V...       |_|   http://sqlmap.org

[*] starting at ${new Date().toLocaleTimeString()}

[INFO] testing connection to the target URL
[INFO] checking if the target is protected by some WAF/IPS
[INFO] testing if the target URL content is stable
[INFO] target URL content is stable
[INFO] testing if GET parameter 'id' is dynamic
[INFO] GET parameter 'id' appears to be dynamic
[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')
[INFO] testing for SQL injection on GET parameter 'id'
[INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[INFO] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable 
[INFO] testing 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[INFO] testing 'MySQL >= 5.0 time-based blind - Parameter replace'
[INFO] GET parameter 'id' is 'MySQL >= 5.0 time-based blind - Parameter replace' injectable 

[*] ending @ ${new Date().toLocaleTimeString()}
            `,
                        type: 'success'
                    };
                }

                default:
                    return { output: `${cmd}: command not found`, type: 'error' };
            }
        } catch (error: any) {
            return { output: error.message, type: 'error' };
        }
    }

    public getHistory(direction: 'up' | 'down'): string {
        if (this.commandHistory.length === 0) return '';

        if (direction === 'up') {
            this.historyIndex = Math.max(0, this.historyIndex - 1);
        } else {
            this.historyIndex = Math.min(this.commandHistory.length, this.historyIndex + 1);
        }

        return this.commandHistory[this.historyIndex] || '';
    }
}
