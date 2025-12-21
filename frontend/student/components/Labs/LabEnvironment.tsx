import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Square, RotateCcw, ExternalLink, CheckCircle } from 'lucide-react';

interface LabEnvironmentProps {
  labId: string;
  labTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

export const LabEnvironment: React.FC<LabEnvironmentProps> = ({ labId, labTitle, onComplete, onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [labStatus, setLabStatus] = useState<'starting' | 'running' | 'completed' | 'error'>('starting');
  const [objectives, setObjectives] = useState<Array<{id: string, description: string, completed: boolean}>>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize lab environment
  useEffect(() => {
    initializeLab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const initializeLab = async () => {
    setLabStatus('starting');
    setTerminalOutput(['Starting lab environment...', 'Initializing containers...', 'Setting up vulnerable applications...']);
    
    // Simulate lab initialization
    setTimeout(() => {
      setLabStatus('running');
      setIsRunning(true);
      setTerminalOutput(prev => [...prev, 'Lab environment ready!', 'Type "help" for available commands.', '']);
      
      // Set lab-specific objectives
      const labObjectives = getLabObjectives(labId);
      setObjectives(labObjectives);
    }, 3000);
  };

  const getLabObjectives = (labId: string) => {
    const objectiveMap: Record<string, Array<{id: string, description: string, completed: boolean}>> = {
      'broken-access-control': [
        { id: 'obj1', description: 'Access user profile without authentication', completed: false },
        { id: 'obj2', description: 'Escalate privileges to admin level', completed: false },
        { id: 'obj3', description: 'Access other users\' data', completed: false },
        { id: 'obj4', description: 'Document the vulnerability', completed: false }
      ],
      'injection': [
        { id: 'obj1', description: 'Identify SQL injection point', completed: false },
        { id: 'obj2', description: 'Extract database schema', completed: false },
        { id: 'obj3', description: 'Retrieve user credentials', completed: false },
        { id: 'obj4', description: 'Demonstrate impact', completed: false }
      ],
      'cryptographic-failures': [
        { id: 'obj1', description: 'Identify weak encryption', completed: false },
        { id: 'obj2', description: 'Intercept plaintext data', completed: false },
        { id: 'obj3', description: 'Crack weak hashes', completed: false },
        { id: 'obj4', description: 'Implement secure solution', completed: false }
      ]
    };
    
    return objectiveMap[labId] || objectiveMap['broken-access-control'];
  };

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    setTerminalOutput(prev => [...prev, `$ ${command}`]);

    // Simulate command execution based on lab type
    setTimeout(() => {
      let response = '';
      
      switch (cmd) {
        case 'help':
          response = `Available commands:
- scan: Scan the target application
- exploit: Run exploitation tools
- burp: Open Burp Suite proxy
- nmap: Network scanning
- sqlmap: SQL injection testing
- dirb: Directory bruteforcing
- nikto: Web vulnerability scanner
- curl: Make HTTP requests
- cat: View file contents
- ls: List directory contents
- clear: Clear terminal`;
          break;
          
        case 'scan':
          response = `Starting vulnerability scan...
Target: http://vulnerable-app.lab:8080
Found: Login form (potential SQL injection)
Found: User profile pages (potential IDOR)
Found: Admin panel (/admin)
Scan complete.`;
          updateObjective('obj1');
          break;
          
        case 'exploit':
          response = `Launching exploitation framework...
Metasploit console ready
Available exploits for target loaded
Use 'show exploits' to list available modules`;
          break;
          
        case 'burp':
          response = `Starting Burp Suite...
Proxy listening on 127.0.0.1:8080
Intercept is ON
Configure your browser to use this proxy`;
          break;
          
        case 'nmap':
          response = `Starting Nmap scan...
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
3306/tcp open  mysql
Scan complete.`;
          break;
          
        case 'sqlmap':
          response = `SQLMap v1.6.12
Testing for SQL injection...
Parameter 'id' appears to be injectable
Payload: ' OR 1=1--
Database: MySQL 8.0
Available databases: webapp, information_schema`;
          updateObjective('obj2');
          break;
          
        case 'dirb':
          response = `DIRB v2.22
Scanning http://vulnerable-app.lab:8080/
+ http://vulnerable-app.lab:8080/admin (CODE:200)
+ http://vulnerable-app.lab:8080/backup (CODE:200)
+ http://vulnerable-app.lab:8080/config (CODE:200)
Scan complete.`;
          break;
          
        case 'nikto':
          response = `Nikto v2.1.6
Target: http://vulnerable-app.lab:8080
+ Server: Apache/2.4.41
+ OSVDB-3233: /admin/: Admin directory found
+ OSVDB-3092: /backup/: Backup directory found
+ Scan complete: 1 host(s) tested`;
          break;
          
        case 'curl http://vulnerable-app.lab:8080/admin':
          response = `HTTP/1.1 200 OK
Content-Type: text/html

<html><body>
<h1>Admin Panel</h1>
<p>Welcome Administrator!</p>
<a href="/users">Manage Users</a>
</body></html>`;
          updateObjective('obj3');
          break;
          
        case 'curl -X POST http://vulnerable-app.lab:8080/login':
          response = `HTTP/1.1 200 OK
Set-Cookie: session=admin_session_12345

{"status":"success","user":"admin","role":"administrator"}`;
          updateObjective('obj2');
          break;
          
        case 'show exploits':
          response = `Available Exploits:
1. web/sql_injection/union_select
2. web/access_control/idor_bypass
3. web/auth/sql_auth_bypass
4. web/xss/stored_payload
5. web/csrf/token_bypass

Use 'use <exploit_name>' to select an exploit`;
          break;
          
        case 'use web/access_control/idor_bypass':
          response = `Exploit selected: IDOR Bypass
Description: Bypass access controls using direct object references
Target: User profile endpoints
Payload ready. Use 'exploit' to execute.`;
          break;
          
        case 'hashcat':
          response = `hashcat v6.2.5
Loading hash file...
Found MD5 hashes:
5d41402abc4b2a76b9719d911017c592:hello
098f6bcd4621d373cade4e832627b4f6:test
Cracking in progress...`;
          break;
          
        case 'john':
          response = `John the Ripper 1.9.0
Loaded 3 password hashes
Using default wordlist
admin123         (admin)
password         (user1)
123456           (user2)
Session completed`;
          break;
          
        case 'ls':
          response = `total 12
drwxr-xr-x 2 user user 4096 Mar 15 10:30 exploits
drwxr-xr-x 2 user user 4096 Mar 15 10:30 payloads
drwxr-xr-x 2 user user 4096 Mar 15 10:30 wordlists
-rw-r--r-- 1 user user  156 Mar 15 10:30 target_info.txt`;
          break;
          
        case 'cat target_info.txt':
          response = `Target Application: Vulnerable Web App
URL: http://vulnerable-app.lab:8080
Technology: PHP/MySQL
Known Vulnerabilities:
- SQL Injection in login form
- Broken Access Control
- Insecure Direct Object References`;
          break;
          
        case 'clear':
          setTerminalOutput([]);
          return;
          
        default:
          response = `Command not found: ${command}
Type 'help' for available commands.`;
      }
      
      setTerminalOutput(prev => [...prev, response, '']);
    }, 500 + Math.random() * 1000);
  };

  const updateObjective = (objectiveId: string) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === objectiveId ? { ...obj, completed: true } : obj
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const stopLab = () => {
    setIsRunning(false);
    setLabStatus('completed');
    setTerminalOutput(prev => [...prev, 'Lab environment stopped.', 'Cleaning up containers...', 'Lab session ended.']);
  };

  const resetLab = () => {
    setTerminalOutput([]);
    setObjectives(prev => prev.map(obj => ({ ...obj, completed: false })));
    initializeLab();
  };

  const allObjectivesCompleted = objectives.every(obj => obj.completed);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Lab
            </button>
            <h1 className="text-xl font-bold">{labTitle} - Live Environment</h1>
            <div className={`px-3 py-1 rounded-full text-sm ${
              labStatus === 'running' ? 'bg-green-900 text-green-300' :
              labStatus === 'starting' ? 'bg-yellow-900 text-yellow-300' :
              labStatus === 'error' ? 'bg-red-900 text-red-300' :
              'bg-gray-700 text-gray-300'
            }`}>
              {labStatus.toUpperCase()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={resetLab}
              className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={stopLab}
              disabled={!isRunning}
              className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Objectives Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Lab Objectives</h2>
          <div className="space-y-3">
            {objectives.map((objective) => (
              <div key={objective.id} className={`p-3 rounded-lg border ${
                objective.completed 
                  ? 'border-green-600 bg-green-900/20' 
                  : 'border-gray-600 bg-gray-700/50'
              }`}>
                <div className="flex items-start space-x-2">
                  {objective.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-500 rounded-full mt-0.5"></div>
                  )}
                  <span className={`text-sm ${objective.completed ? 'text-green-300' : 'text-gray-300'}`}>
                    {objective.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {allObjectivesCompleted && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center space-x-2 text-green-300 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold">All Objectives Complete!</span>
              </div>
              <button
                onClick={onComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
              >
                Complete Lab
              </button>
            </div>
          )}

          {/* Quick Tools */}
          <div className="mt-6">
            <h3 className="text-md font-bold mb-3">Quick Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => executeCommand('scan')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                🔍 Vulnerability Scan
              </button>
              <button
                onClick={() => executeCommand('burp')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                🕷️ Burp Suite
              </button>
              <button
                onClick={() => executeCommand('sqlmap')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                💉 SQLMap
              </button>
              <button
                onClick={() => executeCommand('nmap')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                🌐 Nmap Scan
              </button>
              <button
                onClick={() => executeCommand('hashcat')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                🔐 Hash Cracking
              </button>
              <button
                onClick={() => executeCommand('show exploits')}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                💥 Exploit Framework
              </button>
            </div>
          </div>
        </div>

        {/* Main Lab Area */}
        <div className="flex-1 flex flex-col">
          {/* Target Application */}
          <div className="h-1/2 border-b border-gray-700">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">Target Application</span>
              </div>
              <div className="text-sm text-gray-400">http://vulnerable-app.lab:8080</div>
            </div>
            <div className="h-full bg-white">
              <iframe
                src="data:text/html;charset=utf-8,%3Chtml%3E%3Chead%3E%3Ctitle%3EVulnerable%20Web%20App%3C/title%3E%3Cstyle%3Ebody%7Bfont-family%3AArial%2Csans-serif%3Bmargin%3A20px%3B%7D.container%7Bmax-width%3A800px%3Bmargin%3A0%20auto%3B%7D.login-form%7Bborder%3A1px%20solid%20%23ddd%3Bpadding%3A20px%3Bmargin%3A20px%200%3B%7Dinput%7Bwidth%3A100%25%3Bpadding%3A8px%3Bmargin%3A5px%200%3B%7Dbutton%7Bbackground%3A%23007cba%3Bcolor%3Awhite%3Bpadding%3A10px%2020px%3Bborder%3Anone%3Bcursor%3Apointer%3B%7D.admin-link%7Bcolor%3A%23666%3Bfont-size%3A12px%3B%7D%3C/style%3E%3C/head%3E%3Cbody%3E%3Cdiv%20class%3D%22container%22%3E%3Ch1%3EVulnerable%20Web%20Application%3C/h1%3E%3Cp%3EThis%20is%20a%20deliberately%20vulnerable%20web%20application%20for%20security%20testing.%3C/p%3E%3Cdiv%20class%3D%22login-form%22%3E%3Ch3%3EUser%20Login%3C/h3%3E%3Cform%3E%3Cinput%20type%3D%22text%22%20placeholder%3D%22Username%22%20name%3D%22username%22%3E%3Cinput%20type%3D%22password%22%20placeholder%3D%22Password%22%20name%3D%22password%22%3E%3Cbutton%20type%3D%22submit%22%3ELogin%3C/button%3E%3C/form%3E%3C/div%3E%3Cp%3E%3Ca%20href%3D%22%23%22%20class%3D%22admin-link%22%3EAdmin%20Panel%3C/a%3E%20%7C%20%3Ca%20href%3D%22%23%22%3EUser%20Profiles%3C/a%3E%3C/p%3E%3Cdiv%20style%3D%22margin-top%3A30px%3Bpadding%3A15px%3Bbackground%3A%23f0f0f0%3B%22%3E%3Ch4%3EHints%3A%3C/h4%3E%3Cul%3E%3Cli%3ETry%20SQL%20injection%20in%20the%20login%20form%3C/li%3E%3Cli%3ELook%20for%20hidden%20admin%20functionality%3C/li%3E%3Cli%3ECheck%20for%20direct%20object%20references%3C/li%3E%3C/ul%3E%3C/div%3E%3C/div%3E%3C/body%3E%3C/html%3E"
                className="w-full h-full border-0"
                title="Vulnerable Application"
              />
            </div>
          </div>

          {/* Terminal */}
          <div className="h-1/2 flex flex-col">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span className="font-medium">Security Testing Terminal</span>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 bg-black p-4 font-mono text-sm overflow-y-auto"
            >
              {terminalOutput.map((line, index) => (
                <div key={index} className="text-green-400 whitespace-pre-wrap">
                  {line}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center text-green-400">
                  <span className="mr-2">$</span>
                  <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-transparent border-none outline-none flex-1 text-green-400"
                    placeholder="Enter command..."
                    autoFocus
                  />
                  <span className="animate-pulse">|</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};