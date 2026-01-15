
import { Course, Module, Question } from '../../types/types';

export const vuWebSecurityCourse: Course = {
    id: 'vu-web-security',
    title: 'Web Application Security',
    description: 'Learn to identify and exploit vulnerabilities in web applications, understanding the OWASP Top 10 and secure coding practices, tailored for VU curriculum.',
    teacher_id: 'vu-security-dept',
    is_published: true,
    category: 'vishwakarma-university',
    difficulty: 'intermediate',
    estimated_hours: 20,
    enrollment_count: 0,
    rating: 5,
    modules: [
        {
            id: 'vu-mod-1',
            title: '1. Web Security Fundamentals',
            description: 'The bedrock of security: HTTP vs HTTPS, Sessions, and Definitions.',
            course_id: 'vu-web-security',
            order: 1,
            module_order: 1,
            content: `
        <h1>Module 1: Web Security Fundamentals</h1>
        <h2>Introduction to the Web</h2>
        <p>Before we can exploit web applications, we must master the language of the web: <strong>HTTP</strong>. Every attack, from SQL Injection to XSS, relies on manipulating HTTP requests and responses.</p>

        <h2>The Request-Response Cycle</h2>
        <p>The standard interaction involves a Client (your browser) sending a <strong>Request</strong> and the Server returning a <strong>Response</strong>.</p>

        \`\`\`mermaid
        sequenceDiagram
            participant Client as Browser
            participant Server as Web Server
            participant DB as Database

            Client->>Server: HTTP GET /login
            Server-->>Client: 200 OK (Login Page)
            Client->>Server: POST /login (user=admin, pass=123)
            Server->>DB: SELECT * FROM users (Auth Check)
            DB-->>Server: User Found
            Server-->>Client: 302 Redirect /dashboard
        \`\`\`

        <h2>HTTP Deep Dive</h2>
        <p>HTTP is a plaintext protocol. If you intercept it (using Wireshark or Burp Suite), you can read everything.</p>
        
        <h3>Anatomy of a Request</h3>
        \`\`\`http
        GET /admin HTTP/1.1
        Host: target-bank.com
        Cookie: session=secret_id
        User-Agent: Mozilla/5.0
        \`\`\`
        <p><strong>Method:</strong> GET, POST, PUT, DELETE (Verbs).</p>
        <p><strong>Headers:</strong> Metadata like Cookies, User-Agent.</p>

        <h2>HTTPS: The Secure Layer</h2>
        <p>HTTPS wraps HTTP in a TLS (Transport Layer Security) tunnel. It ensures:</p>
        <ul>
            <li><strong>Encryption:</strong> No one can read the data.</li>
            <li><strong>Integrity:</strong> No one modified the data.</li>
            <li><strong>Authentication:</strong> You are talking to the real server (Verified by Certificates).</li>
        </ul>

        <h2>Why it Matters</h2>
        <p>In 2024, a major breach occurred because a startup used HTTP for their internal admin panel login. Attackers sniffed the credentials from a coffee shop Wi-Fi.</p>
        
        <h2>YouTube Video</h2>
        <p><strong>Title:</strong> HTTP Crash Course & Security<br>
        <strong>Link:</strong> <a href="https://www.youtube.com/watch?v=iYM2zFP3Zn0" target="_blank">https://www.youtube.com/watch?v=iYM2zFP3Zn0</a></p>
      `,
            questions: [
                {
                    id: 'q1',
                    question: 'What is the primary purpose of HTTPS?',
                    options: ['To make websites load faster', 'To encrypt data between the client and server', 'To improve website design', 'To store user passwords securely'],
                    correctAnswer: 1,
                    difficulty: 'easy',
                    explanation: 'HTTPS (Hypertext Transfer Protocol Secure) uses TLS to encrypt communications, preventing attackers from reading sensitive data.'
                },
                {
                    id: 'q1-2',
                    question: 'What is a "Response" in the context of web traffic?',
                    options: ['The user clicking a button', 'The server sending data back to the client', 'The browser closing', 'The internet disconnecting'],
                    correctAnswer: 1,
                    difficulty: 'easy',
                    explanation: 'A response is the message sent by the server to the client after receiving a request.'
                }
            ]
        },
        {
            id: 'vu-mod-2',
            title: '2. Sessions, AuthN & AuthZ',
            description: 'Understanding how we prove identity and permission.',
            course_id: 'vu-web-security',
            order: 2,
            module_order: 2,
            content: `
        <h1>Module 2: Sessions, AuthN & AuthZ</h1>
        <h2>The Big Three</h2>
        <p><strong>1. Authentication (AuthN):</strong> "Who are you?" (Login)</p>
        <p><strong>2. Authorization (AuthZ):</strong> "What are you allowed to do?" (Permissions)</p>
        <p><strong>3. Session Management:</strong> Remembering who you are after you log in.</p>

        <h2>Cookies & Sessions</h2>
        <p>Since HTTP is stateless (it forgets you immediately), we use <strong>Cookies</strong> to store a <strong>Session ID</strong>. If an attacker steals your Session ID (Session Hijacking), they become you.</p>

        <h3>Critical Cookie Attributes</h3>
        <ul>
            <li><strong>Secure:</strong> Only send over HTTPS.</li>
            <li><strong>HttpOnly:</strong> JavaScript cannot read this cookie (Prevents XSS theft).</li>
            <li><strong>SameSite:</strong> strict/lax rules to prevent CSRF.</li>
        </ul>
      `,
            questions: [
                {
                    id: 'q2',
                    question: 'Which cookie attribute prevents JavaScript from accessing the cookie?',
                    options: ['Secure', 'HttpOnly', 'SameSite', 'Max-Age'],
                    correctAnswer: 1,
                    difficulty: 'medium',
                    explanation: 'The HttpOnly flag directs the browser not to expose the cookie to client-side scripts (like JavaScript), mitigating XSS risks.'
                },
                {
                    id: 'q3',
                    question: 'A user logs in successfully but cannot access the admin page. This is an issue of:',
                    options: ['Authentication', 'Authorization', 'Session Fixation', 'Input Validation'],
                    correctAnswer: 1,
                    difficulty: 'medium',
                    explanation: 'Authorization determines what an authenticated user is permitted to do. The user is authenticated (logged in) but not authorized for the admin page.'
                }
            ]
        },
        {
            id: 'vu-mod-3',
            title: '3. Threats & Attack Vectors',
            description: 'How attackers think: Sniffing, Hijacking, and Validation bypass.',
            course_id: 'vu-web-security',
            order: 3,
            module_order: 3,
            content: `
          <h1>Module 3: Threats & Attack Vectors</h1>
          <h2>Common Attacks</h2>
          <h3>1. Sniffing</h3>
          <p>Capturing unencrypted traffic. <strong>Mitigation:</strong> HTTPS.</p>
          
          <h3>2. Session Hijacking</h3>
          <p>Stealing a valid session ID. <strong>Mitigation:</strong> HttpOnly cookies, Session Timeout.</p>
          
          <h3>3. Lack of Input Validation</h3>
          <p>Trusting user input leads to SQL Injection, XSS, etc. <strong>Rule #1: Never Trust User Input.</strong></p>

          <h2>Real World Example</h2>
          <p>Changing parameters in the URL (e.g., ?id=5 to ?id=6) to see someone else's data is a form of attack called IDOR (Insecure Direct Object Reference).</p>
        `,
            questions: [
                {
                    id: 'q5',
                    question: "Where is the most critical place to perform input validation?",
                    options: ['In the HTML form', 'In the JavaScript', 'On the server-side', 'In the database'],
                    correctAnswer: 2,
                    difficulty: 'hard',
                    explanation: "Client-side validation can be bypassed. Server-side validation is mandatory."
                }
            ]
        },
        {
            id: 'vu-mod-4',
            title: '4. OWASP A01: Broken Access Control',
            description: 'The #1 vulnerability: Users accessing what they shouldn\'t.',
            course_id: 'vu-web-security',
            order: 4,
            module_order: 4,
            content: `
          <h1>Module 4: Broken Access Control (A01)</h1>
          <h2>What is it?</h2>
          <p>When a user can access data or perform actions they are not authorized for.</p>

          <h2>Common Types</h2>
          <ul>
            <li><strong>IDOR (Insecure Direct Object Reference):</strong> Changing an ID in a URL (e.g., /invoice/100 to /invoice/101).</li>
            <li><strong>Privilege Escalation:</strong> A user force-browsing to /adminUrl to gain admin powers.</li>
            <li><strong>CORS Misconfiguration:</strong> Allowing unauthorized sites to read your API data.</li>
          </ul>

          <h2>Lab: Broken Access Control</h2>
          <p>In this lab, you will act as an attacker trying to view other users' profiles by manipulating ID parameters.</p>
          
          <div style="margin: 20px 0; padding: 20px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; text-align: center;">
            <p style="color: #00FF88; font-weight: bold; margin-bottom: 15px;">Ready to exploit IDOR?</p>
            <button data-lesson-action="launch-lab" data-lab-id="broken-access-control" style="background-color: #00FF88; color: black; padding: 12px 24px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#00CC66'" onmouseout="this.style.backgroundColor='#00FF88'">Launch Broken Access Control Lab</button>
          </div>
        `,
            questions: [
                {
                    id: 'q4',
                    question: "An attacker changes ?user_id=123 to ?user_id=124 and views another profile. This is:",
                    options: ['SQL Injection', 'XSS', 'IDOR', 'Broken Authentication'],
                    correctAnswer: 2,
                    difficulty: 'medium',
                    explanation: "IDOR (Insecure Direct Object Reference) is a type of Access Control failure."
                }
            ]
        },
        {
            id: 'vu-mod-5',
            title: '5. OWASP A02: Cryptographic Failures',
            description: 'Failures in protecting sensitive data causing breaches.',
            course_id: 'vu-web-security',
            order: 5,
            module_order: 5,
            content: `
          <h1>Module 5: Cryptographic Failures (A02)</h1>
          <h2>The Problem</h2>
          <p>Previously known as "Sensitive Data Exposure". It happens when we don't encrypt data properly.</p>

          <h2>Key Failures</h2>
          <ul>
            <li>Using weak hashes (MD5, SHA1) for passwords.</li>
            <li>Hardcoding keys in source code.</li>
            <li>Transmitting data as HTTP (no TLS).</li>
          </ul>

          <h2>Solution</h2>
          <p>Use <strong>bcrypt</strong> or <strong>Argon2</strong> for passwords. Always use HTTPS. Use a Key Vault for secrets.</p>

          <h2>Lab: Cryptographic Failures</h2>
          <p>Analyze how weak encryption allows attackers to crack passwords and steal data.</p>

          <div style="margin: 20px 0; padding: 20px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; text-align: center;">
            <p style="color: #00FF88; font-weight: bold; margin-bottom: 15px;">Can you crack the code?</p>
            <button data-lesson-action="launch-lab" data-lab-id="cryptographic-failures" style="background-color: #00FF88; color: black; padding: 12px 24px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer;">Launch Cryptographic Failures Lab</button>
          </div>
        `,
            questions: [
                {
                    id: 'm2-q3',
                    question: "Storing passwords using unsalted MD5 is a:",
                    options: ['Broken Access Control', 'Cryptographic Failure', 'Insecure Design', 'Vulnerable Component'],
                    correctAnswer: 1,
                    difficulty: 'medium',
                    explanation: "MD5 is weak and unsalted hashes are vulnerable to rainbow tables."
                }
            ]
        },
        {
            id: 'vu-mod-6',
            title: '6. OWASP A03: Injection Attacks',
            description: 'SQLi, Command Injection, and how to stop them.',
            course_id: 'vu-web-security',
            order: 6,
            module_order: 6,
            content: `
          <h1>Module 6: Injection (A03)</h1>
          <h2>Concept</h2>
          <p>Injection happens when untrusted user data is sent to an interpreter as part of a command or query.</p>

          <h2>SQL Injection (SQLi)</h2>
          <p>The most famous injection. Attackers insert SQL commands into input fields.</p>
          <p><code>SELECT * FROM users WHERE name = '' OR '1'='1';</code></p>
          <p>This trick forces the database to return all records because 1=1 is always true.</p>

          <h2>Defense</h2>
          <p><strong>Prepared Statements (Parameterized Queries).</strong> This separates code from data.</p>

          <h2>Lab: SQL Injection</h2>
          <p>Inject SQL payloads to bypass authentication and dump the database.</p>

          <div style="margin: 20px 0; padding: 20px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; text-align: center;">
            <p style="color: #00FF88; font-weight: bold; margin-bottom: 15px;">Deploy the Payload</p>
            <button data-lesson-action="launch-lab" data-lab-id="sql-injection" style="background-color: #00FF88; color: black; padding: 12px 24px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer;">Launch SQL Injection Lab</button>
          </div>
        `,
            questions: [
                {
                    id: 'm2-q2',
                    question: "What is the most effective defense against SQL Injection?",
                    options: ['WAF', "Blacklisting '", 'Prepared statements', 'HTTPS'],
                    correctAnswer: 2,
                    difficulty: 'easy',
                    explanation: "Prepared statements ensure input is treated as data, not code."
                }
            ]
        },
        {
            id: 'vu-mod-7',
            title: '7. OWASP A04 & A05: Design & Config',
            description: 'Insecure Design and Security Misconfiguration.',
            course_id: 'vu-web-security',
            order: 7,
            module_order: 7,
            content: `
          <h1>Module 7: Design & Configuration</h1>
          <h2>A04: Insecure Design</h2>
          <p>Flaws in the architecture itself. "Secure by Design" is the solution. Example: Not limiting how many times someone can guess a coupon code.</p>

          <div style="margin: 10px 0; padding: 15px; border: 1px solid #333; border-radius: 6px;">
            <h4 style="color:#00FF88; margin-top:0;">Lab: Insecure Design</h4>
            <p style="font-size: 0.9em;">Exploit architectural flaws.</p>
            <button data-lesson-action="launch-lab" data-lab-id="insecure-design" style="background-color: #00B37A; color: black; padding: 8px 16px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer;">Open Lab</button>
          </div>

          <h2>A05: Security Misconfiguration</h2>
          <p>Leaving default passwords (admin/admin), showing full error traces to users, or leaving S3 buckets open.</p>

          <div style="margin: 10px 0; padding: 15px; border: 1px solid #333; border-radius: 6px;">
            <h4 style="color:#00FF88; margin-top:0;">Lab: Misconfiguration</h4>
            <p style="font-size: 0.9em;">Find the hidden leaks.</p>
            <button data-lesson-action="launch-lab" data-lab-id="security-misconfiguration" style="background-color: #00B37A; color: black; padding: 8px 16px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer;">Open Lab</button>
          </div>
        `,
            questions: [
                {
                    id: 'm2-q6',
                    question: "Insecure Design is:",
                    options: ['A coding error', 'A runtime config error', 'An architectural flaw', 'A library issue'],
                    correctAnswer: 2,
                    difficulty: 'medium',
                    explanation: "It refers to logical or architectural flaws that cannot be fixed just by coding better."
                },
                {
                    id: 'm2-q7',
                    question: "Leaving /phpinfo.php accessible is:",
                    options: ['Access Control', 'Injection', 'Security Misconfiguration', 'SSRF'],
                    correctAnswer: 2,
                    difficulty: 'easy',
                    explanation: "It offers unnecessary info to attackers, hence a misconfiguration."
                }
            ]
        },
        {
            id: 'vu-mod-8',
            title: '8. Vulnerable Components & Auth Failures',
            description: 'OWASP A06 and A07.',
            course_id: 'vu-web-security',
            order: 8,
            module_order: 8,
            content: `
          <h1>Module 8: Components & Auth</h1>
          <h2>A06: Vulnerable and Outdated Components</h2>
          <p>Using libraries with known CVEs (like Log4j). You are only as secure as your weakest dependency.</p>

           <div style="margin: 20px 0; padding: 20px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; text-align: center;">
            <p style="color: #00FF88; font-weight: bold; margin-bottom: 15px;">Exploit Weak Dependencies</p>
            <button data-lesson-action="launch-lab" data-lab-id="vulnerable-components" style="background-color: #00FF88; color: black; padding: 12px 24px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer;">Launch Vulnerable Components Lab</button>
          </div>

          <h2>A07: Identification & Authentication Failures</h2>
          <p>Allowing weak passwords, no MFA, or permitting Credential Stuffing attacks.</p>
        `,
            questions: [
                {
                    id: 'm3-q1',
                    question: "Which tool identifies known vulnerabilities in dependencies?",
                    options: ['Burp Suite', 'ZAP', 'OWASP Dependency-Check', 'Nmap'],
                    correctAnswer: 2,
                    difficulty: 'easy',
                    explanation: "Dependency-Check scans usage of libraries against CVE databases."
                }
            ]
        },
        {
            id: 'vu-mod-9',
            title: '9. Advanced Risks (A08-A10)',
            description: 'SSRF, Logging Failures, and Integrity issues.',
            course_id: 'vu-web-security',
            order: 9,
            module_order: 9,
            content: `
            <h1>Module 9: Advanced Risks</h1>
            <h2>A08: Software and Data Integrity Failures</h2>
            <p>Code or updates coming from untrusted sources, or Insecure Deserialization.</p>

            <h2>A09: Logging & Monitoring Failures</h2>
            <p>Not recording logins or failed attacks allows breaches to persist for months.</p>

            <h2>A10: Server-Side Request Forgery (SSRF)</h2>
            <p>Tricking the server into fetching data from the internal network (like AWS Metadata at 169.254.169.254).</p>
         `,
            questions: [
                {
                    id: 'm3-q7',
                    question: "AWS metadata is typically found at:",
                    options: ['127.0.0.1', '192.168.1.1', '8.8.8.8', '169.254.169.254'],
                    correctAnswer: 3,
                    difficulty: 'hard',
                    explanation: "169.254.169.254 is the link-local address for cloud metadata."
                }
            ]
        },
        {
            id: 'vu-mod-10',
            title: '10. Secure SDLC',
            description: 'Building security in from the start.',
            course_id: 'vu-web-security',
            order: 10,
            module_order: 10,
            content: `
            <h1>Module 10: Secure SDLC</h1>
            <h2>Shift Left</h2>
            <p>Test for security early. Don't wait for a pen-test 2 days before launch.</p>
            
            <h2>Threat Modeling</h2>
            <p>Using STRIDE to identify design flaws before writing code.</p>

            <h2>SAST vs DAST</h2>
            <p><strong>SAST:</strong> Scanning source code (White box).</p>
            <p><strong>DAST:</strong> Scanning the running app (Black box).</p>
        `,
            questions: [
                {
                    id: 'm4-q1',
                    question: "What does 'Shift-Left' mean?",
                    options: ['Delay testing', 'Move security earlier in SDLC', 'Hire more devs', 'Use Linux'],
                    correctAnswer: 1,
                    difficulty: 'easy',
                    explanation: "Doing security tasks earlier in the process."
                }
            ]
        },
        {
            id: 'vu-mod-11',
            title: '11. Active Defense',
            description: 'Pen-testing, WAFs, and Incident Response.',
            course_id: 'vu-web-security',
            order: 11,
            module_order: 11,
            content: `
            <h1>Module 11: Active Defense</h1>
            <h2>Penetration Testing</h2>
            <p>Ethical Hacking to find bugs before criminals do.</p>

            <h2>WAF (Web Application Firewall)</h2>
            <p>A firewall that inspects HTTP traffic to block attacks like SQLi.</p>

            <h2>Incident Response</h2>
            <p>Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.</p>
            
            <h3>YouTube Video</h3>
            <p><strong>Title:</strong> Web App Penetration Testing<br>
            <strong>Link:</strong> <a href="https://www.youtube.com/watch?v=2_lswM1S264" target="_blank">https://www.youtube.com/watch?v=2_lswM1S264</a></p>
        `,
            questions: [
                {
                    id: 'm5-q1',
                    question: "Difference between Vuln Assessment and Pen Test?",
                    options: ['Cost', 'Pen tests exploit findings', 'Tools', 'People'],
                    correctAnswer: 1,
                    difficulty: 'medium',
                    explanation: "Pen tests verify risk by exploiting the vulnerability."
                }
            ]
        }
    ]
};
