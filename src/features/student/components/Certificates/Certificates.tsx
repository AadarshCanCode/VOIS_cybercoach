import React, { useState } from 'react';
import { Award, Download, Calendar, Shield, Globe } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { CertificateModal } from './CertificateModal';

export const Certificates: React.FC = () => {
  const { user } = useAuth();
  const earnedCertificates = user?.certificates || [];

  const [viewCertificate, setViewCertificate] = useState<{
    isOpen: boolean;
    courseName: string;
    date: Date;
  } | null>(null);

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

        {/* Awareness Testing Section */}
        <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-4 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-tight">
              Get certified by testing your awareness about cybersecurity
            </h2>
            <p className="text-[#00B37A] max-w-xl mx-auto font-medium">
              Validate your tactical awareness in real-time high-fidelity combat scenarios.
            </p>
          </div>

          <a
            className="flex items-center gap-4 px-10 py-5 text-white bg-white/5 border border-white/10 hover:border-[#00FF88]/40 rounded-[2rem] font-black text-lg transition-all hover:bg-[#00FF88]/5 backdrop-blur-md group/btn shadow-[0_0_30px_rgba(0,255,136,0.1)] hover:shadow-[0_0_50px_rgba(0,255,136,0.2)] relative z-10"
            href="https://cybergame.sparkstudio.co.in/"
            target="_blank"
            rel="noreferrer"
          >
            <Globe className="h-7 w-7 text-[#00FF88] group-hover/btn:rotate-12 transition-transform" />
            LIVE OPS: ASSESSMENT RANGE
          </a>
        </div>

        {/* Earned Certificates */}
        {earnedCertificates.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Acquired Credentials</h2>
            <div className="grid gap-6">
              {earnedCertificates.map((certificateEntry: string, idx: number) => {
                const isUrl = typeof certificateEntry === 'string' && (certificateEntry.startsWith('http://') || certificateEntry.startsWith('https://'));

                if (isUrl) {
                  const filename = certificateEntry.split('/').pop() || "";
                  const parts = filename.split('_');
                  let displayTitle = "Classified Operation";
                  if (parts.length >= 2) {
                    displayTitle = parts[1].replace(/%20/g, ' ');
                  }
                  const timestamp = parseInt(parts[2]?.split('.')[0] || '0');
                  const completionDate = timestamp ? new Date(timestamp) : new Date();

                  return (
                    <div key={`url-${idx}`} className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />
                      <div className="flex items-center justify-between relative">
                        <div className="flex items-center space-x-6">
                          <div className="bg-[#00FF88]/10 p-4 rounded-lg border border-[#00FF88]/20">
                            <Award className="h-8 w-8 text-[#00FF88]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{displayTitle}</h3>
                            <p className="text-[#00B37A] font-mono text-sm">DIGITAL ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-[#EAEAEA]/60 font-mono">
                              <Calendar className="h-3 w-3" />
                              <span>ISSUED: {completionDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={certificateEntry}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-2 bg-black/50 text-[#00FF88] px-4 py-3 rounded-lg border border-[#00FF88]/20 hover:bg-[#00FF88]/10 transition-all font-bold"
                          >
                            <span>PREVIEW</span>
                          </a>
                          <button
                            onClick={() => setViewCertificate({
                              isOpen: true,
                              courseName: displayTitle,
                              date: completionDate
                            })}
                            className="flex items-center space-x-2 bg-[#00FF88] text-black px-6 py-3 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold"
                          >
                            <Download className="h-4 w-4" />
                            <span>DOWNLOAD PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Shield className="h-16 w-16 text-[#00B37A]/20" />
            <p className="text-[#00B37A] font-mono uppercase tracking-[0.2em]">No Credentials Detected In System</p>
          </div>
        )}

      </div>

      {viewCertificate && (
        <CertificateModal
          isOpen={viewCertificate.isOpen}
          onClose={() => setViewCertificate(null)}
          courseName={viewCertificate.courseName}
          studentName={user?.name || 'Operator'}
          completionDate={viewCertificate.date}
          isVU={true}
          facultyName="Kiran Deshpande"
        />
      )}
    </div>
  );
};