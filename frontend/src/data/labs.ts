// Labs data - to be populated with real labs later
export const labs: any[] = [
  {
    id: 'broken-access-control',
    title: 'Broken Access Control',
    description: 'Learn about authorization flaws that allow users to access resources they shouldn\'t have permission to view or modify.',
    difficulty: 'beginner',
    estimatedTime: '30-45 min',
    completed: false,
    tools: ['Browser', 'Developer Tools', 'HTTP Client'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/access-control',
    instructions: `
# Broken Access Control Lab

## Objective
Understand and exploit broken access control vulnerabilities where proper authorization checks are missing or improperly implemented.

## Key Concepts
- **Authorization vs Authentication**: Authentication verifies who you are, authorization determines what you can access
- **Insecure Direct Object References (IDOR)**: Accessing objects by manipulating parameters without proper authorization checks
- **Privilege Escalation**: Gaining higher privileges than intended by the application

## Common Vulnerabilities
- Missing authorization checks on sensitive endpoints
- User can modify their role/permission in requests
- Direct object references without validation
- Horizontal privilege escalation between users
- Vertical privilege escalation to admin functions

## Lab Objectives
1. Identify endpoints without proper authorization
2. Exploit IDOR vulnerabilities to access other users' data
3. Attempt to escalate privileges to admin level
4. Demonstrate the impact of broken access control
    `,
  },
  {
    id: 'cryptographic-failures',
    title: 'Cryptographic Failures',
    description: 'Explore how weak cryptography, poor key management, and insecure data transmission lead to data breaches.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    completed: false,
    tools: ['Browser', 'Burp Suite', 'Hash Cracker'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/crypto',
    instructions: `
# Cryptographic Failures Lab

## Objective
Learn how to identify and exploit weak cryptographic implementations that expose sensitive data.

## Key Concepts
- **Encryption in Transit**: Data should be encrypted when transmitted over networks
- **Encryption at Rest**: Sensitive data should be encrypted when stored
- **Weak Algorithms**: Using outdated or weak encryption methods (MD5, SHA1, DES)
- **Poor Key Management**: Hardcoded keys, weak passwords, insecure storage

## Common Vulnerabilities
- Transmitting sensitive data over HTTP instead of HTTPS
- Using weak hashing algorithms for passwords
- Hardcoded encryption keys in source code
- Inadequate key rotation policies
- Storing passwords in plaintext or with weak hashing

## Lab Objectives
1. Identify unencrypted sensitive data in transit
2. Crack weak password hashes
3. Find hardcoded encryption keys
4. Demonstrate data exposure risks
5. Learn proper cryptographic practices
    `,
  },
  {
    id: 'sql-injection',
    title: 'SQL Injection',
    description: 'Master SQL injection attacks by inserting malicious SQL code into input fields to manipulate database queries.',
    difficulty: 'beginner',
    estimatedTime: '30-45 min',
    completed: false,
    tools: ['Browser', 'SQL Client', 'Burp Suite'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/sqli',
    instructions: `
# SQL Injection Lab

## Objective
Understand and exploit SQL injection vulnerabilities where user input is unsafely concatenated into SQL queries.

## Key Concepts
- **Query Concatenation**: Building SQL queries by directly inserting user input
- **Authentication Bypass**: Using SQL injection to bypass login checks
- **Data Exfiltration**: Extracting unauthorized data from the database
- **Data Manipulation**: Modifying or deleting database records

## Common Vulnerabilities
- Unvalidated user input directly in SQL queries
- Missing input sanitization and parameterized queries
- Error messages revealing database structure
- Time-based blind SQL injection
- Boolean-based blind SQL injection

## Lab Objectives
1. Bypass login forms using SQL injection
2. Extract data from unauthorized tables
3. Determine database structure
4. Modify data using injection
5. Delete records from the database
6. Learn about parameterized queries as protection
    `,
  },
  {
    id: 'insecure-design',
    title: 'Insecure Design',
    description: 'Discover security flaws that arise from poor architectural decisions and missing security controls in the design phase.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    completed: false,
    tools: ['Browser', 'Developer Tools', 'API Tester'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/insecure-design',
    instructions: `
# Insecure Design Lab

## Objective
Learn how architectural flaws and missing security controls during design phase lead to vulnerabilities.

## Key Concepts
- **Threat Modeling**: Identifying potential security threats early
- **Security Requirements**: Defining security needs during design
- **Defense in Depth**: Implementing multiple layers of security
- **Secure by Default**: Security should be the default, not an afterthought

## Common Vulnerabilities
- No rate limiting on sensitive operations
- Missing password reset token validation
- No account lockout after failed login attempts
- Business logic flaws in critical operations
- Missing fraud detection mechanisms
- Insufficient logging and monitoring

## Lab Objectives
1. Exploit missing rate limiting
2. Bypass password reset mechanisms
3. Exploit business logic flaws
4. Perform unauthorized operations
5. Understand importance of threat modeling
6. Learn secure design principles
    `,
  },
  {
    id: 'security-misconfiguration',
    title: 'Security Misconfiguration',
    description: 'Identify and exploit misconfigurations in servers, frameworks, and applications that expose sensitive information.',
    difficulty: 'beginner',
    estimatedTime: '30-45 min',
    completed: false,
    tools: ['Browser', 'Nmap', 'Server Scanner'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/misconfig',
    instructions: `
# Security Misconfiguration Lab

## Objective
Discover how improper configuration of security settings exposes applications to attacks.

## Key Concepts
- **Default Credentials**: Unchanged default usernames and passwords
- **Debug Mode**: Leaving debug/verbose error messages enabled in production
- **Directory Listing**: Web servers configured to display directory contents
- **Unnecessary Services**: Running unneeded services and ports
- **Security Headers**: Missing HTTP security headers

## Common Vulnerabilities
- Default admin credentials still active
- Stack traces revealing application structure
- Directory listing enabled on web server
- Outdated libraries and dependencies
- Verbose error messages in production
- Missing or misconfigured security headers
- Unnecessary HTTP methods enabled (PUT, DELETE)

## Lab Objectives
1. Find and use default credentials
2. Access directory listings
3. Identify and exploit verbose error messages
4. Discover hidden files and configurations
5. Exploit outdated dependencies
6. Understand importance of proper hardening
    `,
  },
  {
    id: 'vulnerable-components',
    title: 'Vulnerable Components',
    description: 'Learn how known vulnerabilities in libraries and dependencies can be exploited to compromise applications.',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    completed: false,
    tools: ['Browser', 'Dependency Scanner', 'Exploit Tools'],
    liveUrl: 'https://vulnarable-labs.onrender.com/lab/vuln-components',
    instructions: `
# Vulnerable Components Lab

## Objective
Understand how using libraries and components with known vulnerabilities creates security risks.

## Key Concepts
- **Dependency Management**: Tracking and updating third-party libraries
- **CVE (Common Vulnerabilities and Exposures)**: Publicly documented vulnerabilities
- **Supply Chain Attack**: Compromising applications through vulnerable dependencies
- **Patching**: Keeping software up-to-date with security fixes

## Common Vulnerabilities
- Using outdated versions of frameworks (Express, Django, Rails)
- Vulnerable JavaScript libraries with known exploits
- Unpatched database systems
- Vulnerable authentication libraries
- Outdated cryptographic libraries
- Known RCE (Remote Code Execution) vulnerabilities in components

## Lab Objectives
1. Identify known vulnerabilities in dependencies
2. Exploit CVE vulnerabilities in components
3. Perform Remote Code Execution
4. Understand supply chain risks
5. Learn dependency scanning tools
6. Implement secure update policies
    `,
  },
];