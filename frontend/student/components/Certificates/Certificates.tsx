import React from 'react';
import { Award, Download, Star, Calendar, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@context/AuthContext';

export const Certificates: React.FC = () => {
  const { user } = useAuth();

  const availableCertificates = [
    {
      id: 'owasp-top-10',
      title: 'OWASP Top 10 Security Risks',
      description: 'Complete understanding of the most critical web application security risks',
      requirements: [
        'Complete all 10 OWASP modules',
        'Pass module tests with 80% or higher',
        'Complete at least 5 hands-on labs',
        'Pass final certification exam'
      ],
      progress: 30,
      earned: false,
      estimatedHours: 20
    },
    {
      id: 'web-app-security',
      title: 'Web Application Security Fundamentals',
      description: 'Comprehensive knowledge of web application security principles and practices',
      requirements: [
        'Complete assessment test',
        'Finish penetration testing modules',
        'Complete secure coding practices',
        'Demonstrate practical skills'
      ],
      progress: 15,
      earned: false,
      estimatedHours: 30
    },
    {
      id: 'ethical-hacking',
      title: 'Certified Ethical Hacker (Prep)',
      description: 'Preparation for ethical hacking certification with hands-on experience',
      requirements: [
        'Complete advanced security modules',
        'Master penetration testing tools',
        'Complete capstone project',
        'Pass comprehensive exam'
      ],
      progress: 5,
      earned: false,
      estimatedHours: 50
    }
  ];

  const earnedCertificates = user?.certificates || [];

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Official <span className="text-[#00FF88]">Credentials</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">VERIFIED OPERATOR STATUS</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-[#00FF88]" />
          </div>
        </div>

        {/* Earned Certificates */}
        {earnedCertificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Acquired Credentials</h2>
            <div className="grid gap-6">
              {earnedCertificates.map((certificateEntry: string, idx: number) => {
                const isUrl = typeof certificateEntry === 'string' && (certificateEntry.startsWith('http://') || certificateEntry.startsWith('https://'));
                const certificate = !isUrl ? availableCertificates.find(c => c.id === certificateEntry) : null;

                if (!isUrl && !certificate) return null;

                if (isUrl) {
                  return (
                    <div key={`url-${idx}`} className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />
                      <div className="flex items-center justify-between relative">
                        <div className="flex items-center space-x-6">
                          <div className="bg-[#00FF88]/10 p-4 rounded-lg border border-[#00FF88]/20">
                            <Award className="h-8 w-8 text-[#00FF88]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Verified Certificate</h3>
                            <p className="text-[#00B37A] font-mono text-sm">DIGITAL ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-[#EAEAEA]/60 font-mono">
                              <Calendar className="h-3 w-3" />
                              <span>ISSUED: {new Date().toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <a href={certificateEntry} target="_blank" rel="noreferrer" className="flex items-center space-x-2 bg-[#00FF88] text-black px-6 py-3 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold">
                          <Download className="h-4 w-4" />
                          <span>DOWNLOAD ENCRYPTED</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={certificate!.id} className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center space-x-6">
                        <div className="bg-[#00FF88]/10 p-4 rounded-lg border border-[#00FF88]/20">
                          <Award className="h-8 w-8 text-[#00FF88]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight">{certificate!.title}</h3>
                          <p className="text-[#00B37A] font-mono text-sm">{certificate!.description}</p>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-[#EAEAEA]/60 font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>ISSUED: 2024-03-15</span>
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center space-x-2 bg-[#00FF88] text-black px-6 py-3 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold">
                        <Download className="h-4 w-4" />
                        <span>DOWNLOAD ENCRYPTED</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Certificates */}
        <div>
          <h2 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Available Credentials</h2>
          <div className="grid gap-6">
            {availableCertificates.map((certificate) => {
              const isEarned = earnedCertificates.includes(certificate.id) || earnedCertificates.some((e: string) => typeof e === 'string' && e.includes(certificate.id));

              return (
                <div key={certificate.id} className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden hover:border-[#00FF88]/30 transition-all duration-300 group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />

                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6">
                        <div className={`p-4 rounded-lg border ${isEarned ? 'bg-[#00FF88]/10 border-[#00FF88]/20' : 'bg-black border-[#00FF88]/10'}`}>
                          <Award className={`h-8 w-8 ${isEarned ? 'text-[#00FF88]' : 'text-[#EAEAEA]/40'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-[#00FF88] transition-colors uppercase tracking-tight">{certificate.title}</h3>
                            {isEarned && <CheckCircle className="h-5 w-5 text-[#00FF88]" />}
                          </div>
                          <p className="text-[#00B37A] mb-4 max-w-2xl">{certificate.description}</p>

                          <div className="flex items-center space-x-6 text-xs text-[#EAEAEA]/60 font-mono mb-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-3 w-3 text-[#00FF88]" />
                              <span>PROFESSIONAL TIER</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3 text-[#00FF88]" />
                              <span>~{certificate.estimatedHours} HOURS EST.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isEarned && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#00FF88] font-mono">{certificate.progress}%</div>
                          <div className="text-[#00B37A] text-[10px] uppercase tracking-wider">Completion</div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isEarned && (
                      <div className="mb-6">
                        <div className="w-full bg-black rounded-full h-1.5 border border-[#00FF88]/10">
                          <div
                            className="bg-[#00FF88] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                            style={{ width: `${certificate.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    <div className="border-t border-[#00FF88]/10 pt-6">
                      <h4 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-3">Clearance Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {certificate.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm group/req">
                            <div className="h-1.5 w-1.5 bg-[#00FF88] rounded-full group-hover/req:shadow-[0_0_5px_#00FF88] transition-all"></div>
                            <span className="text-[#EAEAEA] group-hover/req:text-white transition-colors">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-6 border-t border-[#00FF88]/10">
                      {isEarned ? (
                        <button className="w-full bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 hover:bg-[#00FF88]/20 font-bold">
                          <Download className="h-4 w-4" />
                          <span>DOWNLOAD ENCRYPTED CERTIFICATE</span>
                        </button>
                      ) : (
                        <button className="w-full bg-[#00FF88] text-black py-3 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold uppercase tracking-wide">
                          Resume Training
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-8 bg-[#0A0F0A] border border-[#00FF88]/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,136,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
          <div className="relative z-10">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#00FF88]" />
              Credential Verification Protocols
            </h3>
            <div className="text-[#00B37A] space-y-2 text-sm font-mono">
              <p>• Industry-recognized credentials validating operational capabilities.</p>
              <p>• Encrypted digital certificates with unique hash verification.</p>
              <p>• Continuing education credits for clearance level maintenance.</p>
              <p>• Integration with external professional networks.</p>
              <p>• Real-time synchronization with global security standards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};