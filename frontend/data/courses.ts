export interface CourseData {
  id: string;
  title: string;
  category: 'cybersecurity' | 'ai-ml' | 'teacher-courses';
  url: string;
  description: string;
  disclaimer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const courseCategories: CourseCategory[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Master the art of defending digital assets and ethical hacking',
    icon: '🛡️',
    color: 'from-red-500/20 to-orange-500/20'
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Explore artificial intelligence and build intelligent systems',
    icon: '🤖',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 'teacher-courses',
    title: 'Courses My Teacher',
    description: 'Access courses created by your instructors and mentors',
    icon: '👨‍🏫',
    color: 'from-green-500/20 to-teal-500/20'
  }
];

export const coursesData: CourseData[] = [
  // Cybersecurity Courses
  {
    id: 'cyber-1',
    title: 'Web Application Security',
    category: 'cybersecurity',
    url: 'https://courses-sovap.vercel.app/courses/cyber-1',
    description: 'Learn to identify and exploit vulnerabilities in web applications, understanding the OWASP Top 10 and secure coding practices.',
    disclaimer: 'This course contains practical exercises involving security testing. Always ensure you have proper authorization before testing any system. Unauthorized access to computer systems is illegal.',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    skills: ['OWASP Top 10', 'SQL Injection', 'XSS', 'Security Testing']
  },
  {
    id: 'cyber-2',
    title: 'Network Defense Essentials',
    category: 'cybersecurity',
    url: 'https://courses-sovap.vercel.app/courses/cyber-2',
    description: 'Master network security fundamentals including firewalls, IDS/IPS, and network monitoring to protect organizational infrastructure.',
    disclaimer: 'This course includes network analysis and monitoring techniques. Use these skills responsibly and only on networks you are authorized to access.',
    difficulty: 'Beginner',
    duration: '6 weeks',
    skills: ['Firewalls', 'IDS/IPS', 'Network Monitoring', 'Wireshark']
  },
  {
    id: 'cyber-3',
    title: 'Ethical Hacking & Pen Testing',
    category: 'cybersecurity',
    url: 'https://courses-sovap.vercel.app/courses/cyber-3',
    description: 'Develop advanced penetration testing skills using industry-standard tools and methodologies to identify security weaknesses.',
    disclaimer: 'Penetration testing must only be performed with explicit written authorization. This course is for educational purposes and ethical security professionals only.',
    difficulty: 'Advanced',
    duration: '10 weeks',
    skills: ['Metasploit', 'Nmap', 'Burp Suite', 'Exploit Development']
  },
  {
    id: 'cyber-4',
    title: 'Cryptography & Data Privacy',
    category: 'cybersecurity',
    url: 'https://courses-sovap.vercel.app/courses/cyber-4',
    description: 'Understand cryptographic algorithms, encryption standards, and data privacy regulations to secure sensitive information.',
    disclaimer: 'Strong cryptography may be subject to export controls in some jurisdictions. Ensure compliance with local laws and regulations.',
    difficulty: 'Intermediate',
    duration: '7 weeks',
    skills: ['AES', 'RSA', 'PKI', 'GDPR', 'Encryption']
  },
  
  // AI & Machine Learning Courses
  {
    id: 'ai-1',
    title: 'AI Fundamentals & Ethics',
    category: 'ai-ml',
    url: 'https://courses-sovap.vercel.app/courses/ai-1',
    description: 'Build a strong foundation in artificial intelligence concepts, algorithms, and ethical considerations for responsible AI development.',
    disclaimer: 'AI systems can have significant societal impact. This course emphasizes responsible AI development and ethical decision-making.',
    difficulty: 'Beginner',
    duration: '6 weeks',
    skills: ['AI Basics', 'Ethics', 'Bias Detection', 'Responsible AI']
  },
  {
    id: 'ai-2',
    title: 'Machine Learning Deep Dive',
    category: 'ai-ml',
    url: 'https://courses-sovap.vercel.app/courses/ai-2',
    description: 'Master supervised and unsupervised learning algorithms, feature engineering, and model evaluation techniques.',
    disclaimer: 'Machine learning models require significant computational resources. Ensure you have access to appropriate hardware or cloud services.',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    skills: ['Scikit-learn', 'Regression', 'Classification', 'Clustering']
  },
  {
    id: 'ai-3',
    title: 'Neural Networks & Deep Learning',
    category: 'ai-ml',
    url: 'https://courses-sovap.vercel.app/courses/ai-3',
    description: 'Explore deep neural networks, CNNs, RNNs, and transformer architectures using modern frameworks like TensorFlow and PyTorch.',
    disclaimer: 'Deep learning requires GPUs for efficient training. Consider using cloud platforms like Google Colab or AWS for computational resources.',
    difficulty: 'Advanced',
    duration: '10 weeks',
    skills: ['TensorFlow', 'PyTorch', 'CNNs', 'Transformers']
  },
  {
    id: 'ai-4',
    title: 'Natural Language Processing (NLP)',
    category: 'ai-ml',
    url: 'https://courses-sovap.vercel.app/courses/ai-4',
    description: 'Learn to process and analyze human language using NLP techniques, including sentiment analysis, named entity recognition, and language models.',
    disclaimer: 'NLP models may perpetuate biases present in training data. Critical evaluation and bias mitigation are essential skills covered in this course.',
    difficulty: 'Advanced',
    duration: '9 weeks',
    skills: ['NLTK', 'spaCy', 'BERT', 'GPT', 'Text Analysis']
  }
];

export const getCoursesByCategory = (categoryId: string): CourseData[] => {
  return coursesData.filter(course => course.category === categoryId);
};
