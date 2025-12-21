export const labs = [
  {
    id: 'broken-access-control',
    title: 'Broken Access Control Lab',
    description: 'Practice identifying and exploiting broken access control vulnerabilities',
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    tools: ['Browser', 'Burp Suite', 'OWASP ZAP'],
    liveUrl: 'https://testphp.vulnweb.com/listproducts.php?cat=1',
    instructions: `
# Broken Access Control Lab

## Objective
Learn to identify and exploit broken access control vulnerabilities in web applications.

## Scenario
You have been given access to a vulnerable web application that contains several access control flaws. Your task is to identify and exploit these vulnerabilities in a live environment.

## Lab Environment
- Target Application: http://vulnerable-app.lab:8080
- Live containerized environment with real vulnerabilities
- Interactive terminal with security testing tools
- Real-time objective tracking

## Exercise 1: Horizontal Privilege Escalation
1. Log in as user1
2. Navigate to the user profile page
3. Try to access other users' profiles by manipulating the URL
4. Document what sensitive information you can access

## Exercise 2: Vertical Privilege Escalation
1. As a regular user, attempt to access admin functions
2. Look for hidden admin panels or functionality
3. Try parameter manipulation to gain elevated privileges

## Exercise 3: Insecure Direct Object References
1. Find functionality that references objects by ID
2. Attempt to access objects belonging to other users
3. Test for predictable object identifiers

## Tools Usage
- Burp Suite for request interception and modification
- OWASP ZAP for automated vulnerability scanning
- Custom exploitation scripts and payloads
- Network analysis tools

## Expected Findings
- User profile information disclosure
- Admin panel access
- Unauthorized data modification capabilities
- Business logic bypasses

## Live Environment Features
- Real vulnerable web application
- Interactive security testing terminal
- Objective-based progress tracking
- Immediate feedback on successful exploits

## Remediation
After completing the exercises, review the secure code examples and implement proper access controls.
    `,
    completed: false
  },
  {
    id: 'cryptographic-failures',
    title: 'Cryptographic Failures Lab',
    description: 'Identify weak cryptography and implement secure solutions',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    tools: ['OpenSSL', 'Wireshark', 'Browser Dev Tools'],
    liveUrl: 'https://badssl.com',
    instructions: `
# Cryptographic Failures Lab

## Objective
Understand common cryptographic failures and learn to implement secure cryptographic solutions.

## Lab Environment
- Live vulnerable application with weak cryptography
- Network traffic analysis tools
- Cryptographic testing utilities
- Real-time vulnerability detection

## Exercise 1: Weak Encryption Detection
1. Analyze the application's use of encryption
2. Identify weak or deprecated algorithms
3. Find instances of plaintext transmission
4. Document encryption key management issues

## Exercise 2: Traffic Analysis
1. Use built-in packet capture tools
2. Identify unencrypted sensitive data transmission
3. Analyze SSL/TLS implementation weaknesses
4. Find certificate validation issues

## Exercise 3: Implement Secure Cryptography
1. Review the vulnerable code samples
2. Implement proper encryption using AES-256
3. Add secure key management
4. Implement proper random number generation

## Live Tools Available
- OpenSSL command-line tools
- Custom crypto analysis scripts
- Network packet capture
- Hash cracking utilities

## Common Issues to Find
- MD5/SHA1 usage for passwords
- Hardcoded encryption keys
- Weak random number generation
- Missing TLS validation
- Deprecated SSL/TLS versions

## Interactive Environment
- Real-time cryptographic analysis
- Live SSL/TLS testing
- Interactive hash cracking
- Immediate vulnerability feedback

## Success Criteria
- Identify all cryptographic weaknesses
- Successfully decrypt vulnerable data
- Implement secure alternatives
- Verify secure implementation
    `,
    completed: false
  },
  {
    id: 'injection',
    title: 'SQL Injection Lab',
    description: 'Master SQL injection techniques and prevention methods',
    difficulty: 'intermediate',
    estimatedTime: '90 minutes',
    tools: ['SQLMap', 'Burp Suite', 'Browser'],
    liveUrl: 'https://juice-shop.herokuapp.com',
    instructions: `
# SQL Injection Lab

## Objective
Master various SQL injection techniques and learn effective prevention methods.

## Lab Environment
- Live vulnerable web application with MySQL backend
- Interactive SQL injection testing environment
- Real-time database interaction
- Multiple injection vectors to discover

## Exercise 1: Basic SQL Injection
1. Identify injectable parameters
2. Perform boolean-based blind injection
3. Extract database structure information
4. Retrieve sensitive data from the database

## Exercise 2: Union-Based Injection
1. Determine the number of columns
2. Find injectable union positions
3. Extract data using UNION SELECT
4. Download database contents

## Exercise 3: Automated Exploitation
1. Use built-in SQLMap for automated testing
2. Compare manual vs automated results
3. Dump database contents
4. Perform advanced exploitation techniques

## Live Testing Environment
- Interactive SQL injection terminal
- Real-time payload testing
- Automated vulnerability scanning
- Database content extraction tools

## Available Tools
- SQLMap with custom configurations
- Manual injection testing interface
- Database schema analysis tools
- Payload generation utilities

## Prevention Implementation
1. Review vulnerable PHP/Python code
2. Implement parameterized queries
3. Add input validation
4. Test the secure implementation

## Real-time Features
- Live database responses
- Interactive payload crafting
- Immediate exploitation feedback
- Progress tracking for each injection type

## Success Metrics
- Extract user credentials
- Access admin functionality
- Retrieve all database contents
- Successfully implement secure code
    `,
    completed: false
  },
  {
    id: 'insecure-design',
    title: 'Insecure Design Analysis Lab',
    description: 'Analyze and improve application design security',
    difficulty: 'advanced',
    estimatedTime: '120 minutes',
    tools: ['Threat Modeling Tools', 'Architecture Diagrams', 'Code Review'],
    instructions: `
# Insecure Design Analysis Lab

## Objective
Learn to identify design-level security flaws and apply secure design principles.

## Lab Components
- Application architecture documentation
- Source code repository
- Threat modeling templates
- Design review checklists

## Exercise 1: Threat Modeling
1. Analyze the provided application architecture
2. Identify assets, threats, and attack vectors
3. Create data flow diagrams
4. Perform threat risk assessment
5. Document security requirements

## Exercise 2: Business Logic Analysis
1. Review application workflows
2. Identify business logic flaws
3. Test for race conditions
4. Analyze state management issues
5. Find authorization bypass opportunities

## Exercise 3: Secure Design Implementation
1. Redesign vulnerable components
2. Apply security design patterns
3. Implement defense in depth
4. Add proper error handling
5. Design secure communication patterns

## Design Flaws to Identify
- Missing rate limiting on critical functions
- Inadequate input validation design
- Poor session management architecture
- Insecure direct object references by design
- Missing security controls in workflows

## Threat Modeling Process
1. **Define security objectives**
2. **Create application overview**
3. **Decompose application architecture**
4. **Identify threats using STRIDE**
5. **Document vulnerabilities**
6. **Rate threat risk**
7. **Design security controls**

## STRIDE Analysis
- **Spoofing**: Identity verification weaknesses
- **Tampering**: Data integrity protection gaps
- **Repudiation**: Insufficient logging/auditing
- **Information Disclosure**: Data confidentiality issues
- **Denial of Service**: Availability protection flaws
- **Elevation of Privilege**: Authorization control gaps

## Deliverables
- Complete threat model document
- Security requirements specification
- Secure architecture redesign
- Implementation recommendations
    `,
    completed: false
  },
  {
    id: 'security-misconfiguration',
    title: 'Security Misconfiguration Lab',
    description: 'Identify and fix common security misconfigurations',
    difficulty: 'beginner',
    estimatedTime: '75 minutes',
    tools: ['Nmap', 'Nikto', 'Browser', 'Configuration Scanners'],
    instructions: `
# Security Misconfiguration Lab

## Objective
Identify common security misconfigurations and implement proper security hardening.

## Lab Environment
- Target Servers: Multiple misconfigured services
- Web Applications: Various framework configurations
- Cloud Environment: AWS/Azure misconfigured resources

## Exercise 1: Web Server Misconfiguration
1. Scan for default pages and directories
2. Identify unnecessary services
3. Find missing security headers
4. Discover default credentials
5. Locate backup and temp files

## Exercise 2: Application Server Assessment
1. Check for debug mode enabled
2. Find exposed management interfaces
3. Identify verbose error messages
4. Locate configuration files
5. Test for default settings

## Exercise 3: Cloud Security Assessment
1. Review S3 bucket permissions
2. Check IAM role configurations
3. Analyze security group settings
4. Verify encryption settings
5. Assess logging configurations

## Scanning Commands
\`\`\`bash
# Port scanning
nmap -sS -O target_ip

# Web vulnerability scanning
nikto -h http://target

# Directory bruteforcing
dirb http://target /usr/share/wordlists/dirb/common.txt

# SSL/TLS testing
testssl.sh target:443
\`\`\`

## Security Headers to Check
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection
- Referrer-Policy

## Common Misconfigurations
- Default passwords unchanged
- Unnecessary services running
- Missing security patches
- Open cloud storage buckets
- Overprivileged service accounts
- Missing encryption in transit/rest
- Weak TLS configurations
- Directory listing enabled

## Hardening Checklist
1. Change all default credentials
2. Disable unnecessary services
3. Apply security patches
4. Configure proper permissions
5. Enable security logging
6. Implement security headers
7. Configure SSL/TLS properly
8. Remove development/debug features
    `,
    completed: false
  },
  {
    id: 'vulnerable-components',
    title: 'Vulnerable Components Lab',
    description: 'Identify and manage vulnerable software components',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    tools: ['OWASP Dependency Check', 'Snyk', 'NPM Audit', 'Retire.js'],
    instructions: `
# Vulnerable Components Lab

## Objective
Learn to identify, assess, and manage vulnerable software components and dependencies.

## Lab Environment
- Sample applications with vulnerable dependencies
- Various package managers (npm, pip, maven)
- Vulnerability databases access
- Scanning tools and configurations

## Exercise 1: Dependency Scanning
1. Scan Node.js application dependencies
2. Identify vulnerable npm packages
3. Analyze Python requirements for CVEs
4. Check Java dependencies for known issues
5. Generate vulnerability reports

## Exercise 2: Vulnerability Analysis
1. Research identified CVEs
2. Assess exploitability and impact
3. Prioritize vulnerabilities by risk
4. Create remediation timeline
5. Document business impact

## Exercise 3: Remediation Implementation
1. Update vulnerable components
2. Apply security patches
3. Remove unused dependencies
4. Implement alternative solutions
5. Verify fixes and retest

## Scanning Tools and Commands
\`\`\`bash
# Node.js dependency scanning
npm audit
npm audit fix

# Python dependency scanning
pip-audit
safety check

# Java dependency scanning (using OWASP Dependency Check)
mvn org.owasp:dependency-check-maven:check

# Retire.js for JavaScript
retire --js --outputformat json
\`\`\`

## OWASP Dependency Check
\`\`\`bash
# Download and run dependency check
wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.0.0/dependency-check-8.0.0-release.zip
unzip dependency-check-8.0.0-release.zip
./dependency-check/bin/dependency-check.sh --project "TestApp" --scan ./src --format HTML
\`\`\`

## Vulnerability Databases
- National Vulnerability Database (NVD)
- CVE Details
- Snyk Vulnerability Database
- GitHub Security Advisories
- Vendor security bulletins

## Component Inventory Tasks
1. Create comprehensive component list
2. Track version numbers
3. Monitor for updates
4. Assess component necessity
5. Plan upgrade schedules

## Risk Assessment Criteria
- CVSS score analysis
- Exploitability assessment
- Asset criticality
- Exposure level
- Available patches/workarounds

## Success Metrics
- All vulnerabilities identified and cataloged
- Risk assessment completed
- Remediation plan created
- Critical vulnerabilities patched
- Process documentation updated
    `,
    completed: false
  }
];