import React from 'react';
import { User, Award, BookOpen, Target, Clock, Star, Shield, Activity, Zap } from 'lucide-react';
import { useAuth } from '@context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first assessment', icon: Target, earned: user.completedAssessment },
    { id: 2, title: 'Knowledge Seeker', description: 'Completed 3 course modules', icon: BookOpen, earned: false },
    { id: 3, title: 'Lab Expert', description: 'Completed 5 hands-on labs', icon: Star, earned: false },
    { id: 4, title: 'Security Pro', description: 'Earned your first certificate', icon: Award, earned: (user.certificates?.length ?? 0) > 0 },
  ];

  const skillProgress = [
    { skill: 'WEB APP SECURITY', progress: 65, color: 'bg-[#00FF88]' },
    { skill: 'NETWORK DEFENSE', progress: 30, color: 'bg-blue-500' },
    { skill: 'CRYPTOGRAPHY', progress: 45, color: 'bg-purple-500' },
    { skill: 'INCIDENT RESPONSE', progress: 20, color: 'bg-red-500' },
    { skill: 'PENETRATION TESTING', progress: 35, color: 'bg-yellow-500' },
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
            <p className="text-[#00B37A] font-mono text-sm mt-1">PERSONNEL DOSSIER</p>
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
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">{user.name}</h2>
              <p className="text-[#00B37A] font-mono text-sm">{user.email}</p>
              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${user.level === 'advanced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  user.level === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20'
                  }`}>
                  {(user.level || 'beginner').toUpperCase()} CLEARANCE
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-[#00FF88]/20 bg-black text-[#EAEAEA]">
                  ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right bg-black p-4 rounded-xl border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              <div className="text-4xl font-black text-[#00FF88] mb-1 font-mono">85%</div>
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
              {skillProgress.map((skill, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between text-xs text-[#EAEAEA] mb-2 font-mono uppercase tracking-wider">
                    <span className="group-hover:text-[#00FF88] transition-colors">{skill.skill}</span>
                    <span className="text-[#00FF88]">{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-black rounded-full h-1.5 border border-[#00FF88]/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 relative ${skill.color}`}
                      style={{ width: `${skill.progress}%`, boxShadow: `0 0 10px ${skill.color === 'bg-[#00FF88]' ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.2)'}` }}
                    >
                    </div>
                  </div>
                </div>
              ))}
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
                <div className="text-2xl font-bold text-white mb-1 font-mono">3</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Modules</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Target className="h-6 w-6 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">2</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Simulations</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">24</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Hours Active</div>
              </div>
              <div className="text-center p-5 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-all group">
                <Award className="h-6 w-6 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1 font-mono">{(user.certificates?.length ?? 0)}</div>
                <div className="text-[#EAEAEA]/60 text-[10px] uppercase tracking-wider">Awards</div>
              </div>
            </div>
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

        {/* Recent Activity */}
        <div className="bg-[#0A0F0A] rounded-2xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
          <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Mission Log
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-colors group">
              <div className="w-2 h-2 bg-[#00FF88] rounded-full shadow-[0_0_10px_#00FF88]"></div>
              <span className="flex-1 text-[#EAEAEA] font-mono text-sm group-hover:text-white transition-colors">COMPLETED ASSESSMENT TEST</span>
              <span className="text-[#00B37A] text-xs font-mono">0200 HOURS</span>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-colors group">
              <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_#FBBF24]"></div>
              <span className="flex-1 text-[#EAEAEA] font-mono text-sm group-hover:text-white transition-colors">INITIATED OWASP TOP 10 PROTOCOL</span>
              <span className="text-[#00B37A] text-xs font-mono">1 DAY AGO</span>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-black rounded-xl border border-[#00FF88]/10 hover:border-[#00FF88]/30 transition-colors group">
              <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA]"></div>
              <span className="flex-1 text-[#EAEAEA] font-mono text-sm group-hover:text-white transition-colors">OPERATIVE ACTIVATED</span>
              <span className="text-[#00B37A] text-xs font-mono">3 DAYS AGO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};