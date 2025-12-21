export interface NetworkResponse {
    status: number;
    statusText: string;
    data: string;
    headers: { [key: string]: string };
}

export interface Vulnerability {
    type: string;
    parameter: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

export class NetworkSimulator {
    private targets: { [url: string]: any } = {
        'http://vulnerable-bank.lab:8080': {
            ip: '192.168.1.10',
            ports: [80, 8080, 22],
            vulnerabilities: [
                { type: 'IDOR', parameter: 'id', severity: 'high', description: 'Insecure Direct Object Reference in user profile' },
                { type: 'SQL Injection', parameter: 'username', severity: 'critical', description: 'SQLi in login form' }
            ],
            endpoints: {
                '/': '<html><body><h1>Welcome to Vulnerable Bank</h1><a href="/login">Login</a></body></html>',
                '/login': '<html><body><form action="/auth" method="POST"><input name="username"><input name="password"></form></body></html>',
                '/api/users': '{"users": [{"id": 1, "name": "admin"}, {"id": 2, "name": "user"}]}'
            }
        },
        'http://shop.vulnerable.lab:8080': {
            ip: '192.168.1.20',
            ports: [80, 443, 8080, 3306],
            vulnerabilities: [
                { type: 'XSS', parameter: 'search', severity: 'medium', description: 'Reflected XSS in search bar' },
                { type: 'Command Injection', parameter: 'ip', severity: 'critical', description: 'OS Command Injection in ping tool' }
            ],
            endpoints: {
                '/': '<html><body><h1>Vulnerable Shop</h1><input name="search"></body></html>',
                '/admin': '403 Forbidden'
            }
        }
    };

    public async fetch(url: string): Promise<NetworkResponse> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));

        const target = Object.keys(this.targets).find(t => url.startsWith(t));

        if (!target) {
            return {
                status: 404,
                statusText: 'Not Found',
                data: 'DNS_PROBE_FINISHED_NXDOMAIN',
                headers: {}
            };
        }

        const path = url.replace(target, '') || '/';
        const endpoint = this.targets[target].endpoints[path];

        if (endpoint) {
            return {
                status: 200,
                statusText: 'OK',
                data: endpoint,
                headers: { 'Content-Type': 'text/html', 'Server': 'Apache/2.4.41' }
            };
        }

        return {
            status: 404,
            statusText: 'Not Found',
            data: '404 Not Found',
            headers: { 'Content-Type': 'text/html' }
        };
    }

    public scan(target: string): any {
        const targetData = Object.values(this.targets).find(t => t.ip === target || Object.keys(this.targets).some(k => k.includes(target)));

        if (!targetData) {
            return { error: 'Host down or unreachable' };
        }

        return {
            ip: targetData.ip,
            ports: targetData.ports.map((p: number) => ({ port: p, state: 'open', service: this.getService(p) })),
            os: 'Linux 5.4.0-42-generic'
        };
    }

    private getService(port: number): string {
        const services: { [key: number]: string } = {
            21: 'ftp',
            22: 'ssh',
            80: 'http',
            443: 'https',
            3306: 'mysql',
            8080: 'http-proxy'
        };
        return services[port] || 'unknown';
    }
}
