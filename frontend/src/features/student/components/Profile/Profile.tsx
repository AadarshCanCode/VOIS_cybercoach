import React, { useEffect, useState } from 'react';
import { User, Award, BookOpen, Target, Clock, Star, Shield, Activity, Zap, Terminal, Download } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { courseService } from '@services/courseService';
import { CertificateModal } from '../Certificates/CertificateModal';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModules: 0,
    completedModules: 0,
    coursesEnrolled: 0,
    certificatesEarned: 0,
    hoursActive: 0
  });
  const [courseProgress, setCourseProgress] = useState<{ title: string, progress: number }[]>([]);
  const [vuDetails, setVuDetails] = useState<any>(null);

  const [viewCertificate, setViewCertificate] = useState<{
    isOpen: boolean;
    courseName: string;
    date: Date;
  } | null>(null);

  useEffect(() => {
    const fetchVuDataOnly = async () => {
      // 1. Check for VU Student (MongoDB) - Primary & Only Source as requested
      const vuEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('vu_student_email') : null;

      if (!vuEmail) {
        setLoading(false);
        return; // No VU account connected
      }

      try {
        setLoading(true);
        const vuStudent = await courseService.getVUStudent(vuEmail);

        if (vuStudent) {
          setVuDetails(vuStudent);

          // Calculate VU Progress specifically for the know VU course(s)
          // Currently hardcoded to 'vu-web-security' as the main VU offering
          const vuTotal = 11;
          const vuCompleted = (vuStudent.progress || []).filter((p: any) => p.course_id === 'vu-web-security' && p.completed).length;
          const percent = Math.round((vuCompleted / vuTotal) * 100);

          setCourseProgress([{
            title: 'Web Application Security',
            progress: percent
          }]);

          setStats({
            totalModules: 11, // Total for this course
            completedModules: vuCompleted,
            coursesEnrolled: 1, // Focus on this specific verified program
            certificatesEarned: user?.certificates?.length || 0, // Still use auth user for certificate storage if needed, or could fetch from VU
            hoursActive: Math.round((vuCompleted * 2) + 12)
          });
        }
      } catch (err) {
        console.error("VU profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVuDataOnly();
  }, [user]);

  if (!user) return null;

  // Safe user access for achievements (Extended with VU data awareness)
  const extendedUser = user as any;
  const userLevel = extendedUser.level || 'beginner';
  // Mission readiness based on the loaded VU stats
  const missionReadiness = stats.totalModules > 0
    ? Math.round((stats.completedModules / stats.totalModules) * 100)
    : 0;

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first assessment', icon: Target, earned: extendedUser.completedAssessment },
    { id: 2, title: 'Knowledge Seeker', description: 'Completed 3 course modules', icon: BookOpen, earned: stats.completedModules >= 3 },
    { id: 3, title: 'Lab Expert', description: 'Completed 5 hands-on labs', icon: Star, earned: false },
    { id: 4, title: 'Security Pro', description: 'Earned your first certificate', icon: Award, earned: stats.certificatesEarned > 0 },
  ];

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Operator <span className="text-[#00FF88]">Profile</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">PERSONNEL RESUME</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <User className="h-5 w-5 text-[#00FF88]" />
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/20 p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center border-2 border-[#00FF88]/30 shadow-[0_0_20px_rgba(0,255,136,0.2)] relative">
              <User className="h-12 w-12 text-[#00FF88]" />
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-[#00FF88] rounded-full border-4 border-black flex items-center justify-center">
                <Shield className="h-3 w-3 text-black fill-current" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">{vuDetails?.name || user.name}</h2>
              <p className="text-[#00B37A] font-mono text-sm">{vuDetails?.email || user.email}</p>
              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${userLevel === 'advanced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  userLevel === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20'
                  }`}>
                  {userLevel.toUpperCase()} CLEARANCE
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-[#00FF88]/20 bg-black text-[#EAEAEA]">
                  ID: {user.id ? user.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right bg-black p-4 rounded-xl border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              <div className="text-4xl font-black text-[#00FF88] mb-1 font-mono">{missionReadiness}%</div>
              <div className="text-[#00B37A] text-[10px] uppercase tracking-wider">Mission Readiness</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Progress */}
          <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Combat Capabilities
            </h3>
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Terminal className="h-6 w-6 animate-spin text-[#00FF88]" />
                </div>
              ) : courseProgress.length > 0 ? (
                courseProgress.map((cp, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between text-xs text-[#EAEAEA] mb-2 font-mono uppercase tracking-wider">
                      <span className="group-hover:text-[#00FF88] transition-colors">{cp.title}</span>
                      <span className="text-[#00FF88]">{cp.progress}%</span>
                    </div>
                    <div className="w-full bg-black rounded-full h-1.5 border border-[#00FF88]/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 relative bg-[#00FF88]"
                        style={{ width: `${cp.progress}%`, boxShadow: '0 0 10px rgba(0,255,136,0.5)' }}
                      >
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 italic">
                  No verified field operations detected.
                  <br />
                  <span className="text-xs text-gray-600">Ensure your VU account is connected.</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Operational Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <BookOpen className="h-6 w-6 text-[#00FF88] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">{stats.completedModules}</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Modules Cleared</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Target className="h-6 w-6 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">{Math.floor(stats.completedModules / 3)}</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Simulations</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">{stats.hoursActive}</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Hours Active</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Award className="h-6 w-6 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">{stats.certificatesEarned}</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Awards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
          <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Service Ribbons & Certificates
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {user.certificates && user.certificates.length > 0 ? (
              user.certificates.map((certUrl: string, idx: number) => {
                const filename = certUrl.split('/').pop() || "";
                const parts = filename.split('_');
                let displayTitle = "Classified Operation";
                if (parts.length >= 2) {
                  displayTitle = parts[1].replace(/%20/g, ' ');
                }
                const timestamp = parseInt(parts[2]?.split('.')[0] || '0');
                const completionDate = timestamp ? new Date(timestamp) : new Date();

                return (
                  <div key={idx} className="group relative rounded-xl overflow-hidden border border-[#00FF88]/20 bg-black/50 hover:border-[#00FF88]/50 transition-all duration-300">
                    {/* Image Preview */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      <img
                        src={certUrl}
                        alt={`Certificate for ${displayTitle}`}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white uppercase tracking-tight text-lg drop-shadow-md">{displayTitle}</h4>
                          <p className="text-xs font-mono text-[#00FF88] flex items-center gap-1 shadow-black drop-shadow-sm">
                            <Shield className="h-3 w-3" /> VERIFIED CREDENTIAL
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={certUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-black/50 text-[#00FF88] border border-[#00FF88]/50 rounded-lg hover:bg-[#00FF88]/10 transition-colors"
                            title="View Preview"
                          >
                            <Award className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => setViewCertificate({
                              isOpen: true,
                              courseName: displayTitle,
                              date: completionDate
                            })}
                            className="p-2 bg-[#00FF88] text-black rounded-lg hover:bg-[#00CC6A] transition-colors shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                            title="Download PDF"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback: If 100% progress but no cert yet (maybe delayed), show pending state
              courseProgress.some(p => p.progress === 100) ? (
                <div className="col-span-1 text-center py-12 border border-[#00FF88]/30 border-dashed rounded-xl bg-[#00FF88]/5 animate-pulse">
                  <Award className="h-12 w-12 mx-auto mb-3 text-[#00FF88]" />
                  <h4 className="text-[#00FF88] font-bold uppercase tracking-wider mb-1">Mission Complete</h4>
                  <p className="text-xs text-[#00B37A] font-mono">Processing Certification Request...</p>
                </div>
              ) : (
                <div className="col-span-1 text-center py-8 border border-white/5 rounded-xl bg-black/50 text-gray-500 italic">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No certifications declassified yet. Check Mission Log.
                </div>
              )
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
          <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Service Ribbons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className={`p-5 rounded-xl border transition-all duration-300 ${achievement.earned
                  ? 'border-[#00FF88]/30 bg-[#00FF88]/5 hover:bg-[#00FF88]/10'
                  : 'border-white/5 bg-black opacity-50'
                  }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${achievement.earned
                      ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20'
                      : 'bg-white/5 text-slate-500 border border-white/5'
                      }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold mb-1 uppercase tracking-tight ${achievement.earned ? 'text-white' : 'text-slate-500'
                        }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-xs font-mono ${achievement.earned ? 'text-[#00B37A]' : 'text-slate-600'
                        }`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <div className="bg-[#00FF88]/20 p-1.5 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                        <Award className="h-3 w-3 text-[#00FF88]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {viewCertificate && (
        <CertificateModal
          isOpen={viewCertificate.isOpen}
          onClose={() => setViewCertificate(null)}
          courseName={viewCertificate.courseName}
          studentName={vuDetails?.name || user?.name || 'Operator'}
          completionDate={viewCertificate.date}
          isVU={true}
          facultyName="Kiran Deshpande"
        />
      )}
    </div>
  );
};