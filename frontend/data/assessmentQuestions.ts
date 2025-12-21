import { Question } from '@types';

export const assessmentQuestions: Question[] = [
  {
    id: '1',
    question: 'What does CIA stand for in cybersecurity?',
    options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Cyber Intelligence Analysis', 'Computer Information Assurance'],
    correctAnswer: 1,
    explanation: 'CIA in cybersecurity refers to the three fundamental principles: Confidentiality, Integrity, and Availability.',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'Which of the following is NOT a type of malware?',
    options: ['Virus', 'Trojan', 'Firewall', 'Ransomware'],
    correctAnswer: 2,
    explanation: 'A firewall is a security system that monitors network traffic, not a type of malware.',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is SQL injection?',
    options: ['A type of network attack', 'A method to inject malicious SQL code into applications', 'A database optimization technique', 'A type of encryption'],
    correctAnswer: 1,
    explanation: 'SQL injection is a code injection technique that attackers use to exploit vulnerabilities in applications.',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'What is the primary purpose of encryption?',
    options: ['Speed up data transfer', 'Compress data', 'Protect data confidentiality', 'Reduce storage space'],
    correctAnswer: 2,
    explanation: 'Encryption transforms data into an unreadable format to protect its confidentiality.',
    difficulty: 'easy'
  },
  {
    id: '5',
    question: 'Which port is commonly used for HTTPS?',
    options: ['80', '443', '22', '21'],
    correctAnswer: 1,
    explanation: 'Port 443 is the standard port for HTTPS (HTTP Secure) connections.',
    difficulty: 'medium'
  },
  {
    id: '6',
    question: 'What is a zero-day vulnerability?',
    options: ['A vulnerability that has been patched', 'A vulnerability unknown to security vendors', 'A vulnerability in day-zero systems', 'A type of denial of service attack'],
    correctAnswer: 1,
    explanation: 'A zero-day vulnerability is a security flaw that is unknown to security vendors and has no available patch.',
    difficulty: 'hard'
  },
  {
    id: '7',
    question: 'What does MFA stand for?',
    options: ['Multiple Factor Authentication', 'Multi-Factor Authentication', 'Master File Access', 'Managed File Access'],
    correctAnswer: 1,
    explanation: 'MFA stands for Multi-Factor Authentication, a security method requiring multiple verification factors.',
    difficulty: 'easy'
  },
  {
    id: '8',
    question: 'Which of the following is a social engineering attack?',
    options: ['DDoS', 'Phishing', 'Buffer overflow', 'Man-in-the-middle'],
    correctAnswer: 1,
    explanation: 'Phishing is a social engineering attack that tricks users into revealing sensitive information.',
    difficulty: 'easy'
  },
  {
    id: '9',
    question: 'What is the principle of least privilege?',
    options: ['Giving users maximum access', 'Giving users minimum necessary access', 'Removing all user privileges', 'Sharing privileges among users'],
    correctAnswer: 1,
    explanation: 'The principle of least privilege means giving users only the minimum access necessary to perform their job.',
    difficulty: 'medium'
  },
  {
    id: '10',
    question: 'What is a honeypot in cybersecurity?',
    options: ['A type of malware', 'A decoy system to attract attackers', 'A backup system', 'A type of firewall'],
    correctAnswer: 1,
    explanation: 'A honeypot is a decoy system designed to attract and detect unauthorized access attempts.',
    difficulty: 'medium'
  },
  {
    id: '11',
    question: 'Which protocol is used for secure file transfer?',
    options: ['FTP', 'HTTP', 'SFTP', 'SMTP'],
    correctAnswer: 2,
    explanation: 'SFTP (SSH File Transfer Protocol) provides secure file transfer capabilities.',
    difficulty: 'medium'
  },
  {
    id: '12',
    question: 'What is cross-site scripting (XSS)?',
    options: ['A network protocol', 'A type of injection attack', 'A backup method', 'A firewall rule'],
    correctAnswer: 1,
    explanation: 'XSS is a type of injection attack where malicious scripts are injected into trusted websites.',
    difficulty: 'medium'
  },
  {
    id: '13',
    question: 'What does SIEM stand for?',
    options: ['Security Information and Event Management', 'System Integration and Event Monitoring', 'Security Integration and Error Management', 'System Information and Error Monitoring'],
    correctAnswer: 0,
    explanation: 'SIEM stands for Security Information and Event Management, used for real-time security monitoring.',
    difficulty: 'hard'
  },
  {
    id: '14',
    question: 'Which of the following is NOT a common password attack?',
    options: ['Brute force', 'Dictionary attack', 'Rainbow table', 'Buffer overflow'],
    correctAnswer: 3,
    explanation: 'Buffer overflow is a memory corruption attack, not specifically a password attack.',
    difficulty: 'medium'
  },
  {
    id: '15',
    question: 'What is the purpose of a digital certificate?',
    options: ['To encrypt data', 'To verify identity and enable secure communication', 'To store passwords', 'To backup data'],
    correctAnswer: 1,
    explanation: 'Digital certificates verify identity and enable secure, authenticated communication.',
    difficulty: 'medium'
  },
  {
    id: '16',
    question: 'What is a APT in cybersecurity?',
    options: ['Application Protection Tool', 'Advanced Persistent Threat', 'Automated Patch Tool', 'Access Point Technology'],
    correctAnswer: 1,
    explanation: 'APT stands for Advanced Persistent Threat, a prolonged and targeted cyberattack.',
    difficulty: 'hard'
  },
  {
    id: '17',
    question: 'Which encryption algorithm is considered secure for current use?',
    options: ['DES', 'MD5', 'AES-256', 'SHA-1'],
    correctAnswer: 2,
    explanation: 'AES-256 is currently considered a secure encryption algorithm for most applications.',
    difficulty: 'medium'
  },
  {
    id: '18',
    question: 'What is the main purpose of penetration testing?',
    options: ['To install software', 'To identify and exploit vulnerabilities', 'To backup data', 'To train users'],
    correctAnswer: 1,
    explanation: 'Penetration testing involves systematically testing systems to identify and exploit vulnerabilities.',
    difficulty: 'medium'
  },
  {
    id: '19',
    question: 'What does OWASP stand for?',
    options: ['Open Web Application Security Project', 'Organized Web Application Security Protocol', 'Online Web Application Security Platform', 'Official Web Application Security Process'],
    correctAnswer: 0,
    explanation: 'OWASP stands for Open Web Application Security Project, a nonprofit focused on web security.',
    difficulty: 'easy'
  },
  {
    id: '20',
    question: 'Which of the following is a characteristic of a strong password?',
    options: ['Uses only lowercase letters', 'Contains personal information', 'Is at least 12 characters with mixed case, numbers, and symbols', 'Is easy to remember and commonly used'],
    correctAnswer: 2,
    explanation: 'Strong passwords should be at least 12 characters long and include a mix of uppercase, lowercase, numbers, and symbols.',
    difficulty: 'easy'
  }
];