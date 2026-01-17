import React, { useEffect, useState } from 'react';
import { Shield, Target, Award, Activity, Play, ChevronRight, Terminal, FileText } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { supabase } from '@lib/supabase';
import { SEO } from '@/components/SEO/SEO';
import { studentService, StudentStats, RecentActivity, ActiveOperation } from '@services/studentService';
import { labApiService, LabStats } from '@services/labApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<StudentStats>({
    coursesCompleted: 0,
    assessmentScore: null,
    certificatesEarned: 0,
    liveLabsCompleted: 0,
    studyTime: '0 hours'
  });
  const [labStats, setLabStats] = useState<LabStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activeOperation, setActiveOperation] = useState<ActiveOperation | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [newStats, newActivity, newActiveOp, newLabStats] = await Promise.all([
        studentService.getDashboardStats(user.id),
        studentService.getRecentActivity(user.id),
        studentService.getActiveOperation(user.id),
        labApiService.getLabStats().catch(() => ({ totalLabs: 6, completedLabs: 0, completionPercentage: 0, completedLabIds: [] }))
      ]);
      setStatsData(newStats);
      setActivities(newActivity);
      setActiveOperation(newActiveOp);
      setLabStats(newLabStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default/fallback values
      setStatsData({
        coursesCompleted: 0,
        assessmentScore: null,
        certificatesEarned: 0,
        liveLabsCompleted: 0,
        studyTime: '0 hours'
      });
      setLabStats({
        totalLabs: 6,
        completedLabs: 0,
        completionPercentage: 0,
        completedLabIds: []
      });
    }
  };

  useEffect(() => {
    loadData();

    if (!user?.id) return;

    const channel = supabase
      .channel('student-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="p-6 space-y-8 min-h-screen animate-fade-in text-[#EAEAEA]">
      <SEO
        title="Standard Dashboard"
        description="Your central command unit for monitoring cybersecurity training progress, labs, and certificates."
      />
      {/* Header - Identity */}
      <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-[#00B37A] uppercase tracking-widest">Clearance Level</p>
            <p className="font-bold text-[#EAEAEA]">{user?.level || 'NOVICE'}</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#00FF88]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Active Operation (Hero) */}
          <div className="relative group overflow-hidden rounded-2xl border border-[#00FF88]/20 bg-[#0A0F0A]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,136,0.05)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
            <div className="relative p-8">
              {activeOperation ? (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
                        </span>
                        <span className="text-xs font-bold text-[#00FF88] uppercase tracking-widest">Active Operation</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">{activeOperation.title}</h2>
                      <p className="text-[#00B37A] max-w-lg">{activeOperation.description}</p>
                      <p className="text-[#00B37A] text-sm mt-2">Current module: {activeOperation.currentModule}</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="h-16 w-16 rounded-full border-4 border-[#00FF88]/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#00FF88]">{activeOperation.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="w-full bg-[#000000] rounded-full h-1.5 overflow-hidden border border-[#00FF88]/10">
                      <div className="bg-[#00FF88] h-full rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" style={{ width: `${activeOperation.progress}%` }}></div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                        <Play className="h-4 w-4 fill-current" />
                        RESUME MISSION
                      </button>
                      <button className="px-4 py-3 rounded-lg border border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors">
                        <Terminal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-white mb-4">No Active Operations</h2>
                  <p className="text-[#00B37A] mb-8">Start a new course to begin your mission.</p>
                  <button onClick={() => onTabChange?.('courses')} className="bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold py-3 px-8 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                    BROWSE COURSES
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mission Progress */}
          <Card variant="glass" className="border-[#00FF88]/10 bg-[#0A0F0A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#EAEAEA]">
                <Activity className="h-5 w-5 text-[#00FF88]" />
                Mission Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  label: 'Live Security Labs',
                  progress: labStats ? (labStats.completedLabs / labStats.totalLabs) * 100 : (statsData.liveLabsCompleted / 6) * 100,
                  total: labStats ? `${labStats.completedLabs}/${labStats.totalLabs}` : `${statsData.liveLabsCompleted}/6`,
                  color: 'text-[#00CC66]',
                  bar: 'bg-[#00CC66]'
                },
                { label: 'Skill Assessment', progress: user?.completedAssessment ? 100 : 0, total: user?.completedAssessment ? 'Complete' : 'Pending', color: 'text-[#00B37A]', bar: 'bg-[#00B37A]' }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#EAEAEA] font-medium group-hover:text-[#00FF88] transition-colors">{item.label}</span>
                    <span className="text-[#00B37A] font-mono text-xs">{item.total}</span>
                  </div>
                  <div className="w-full bg-[#000000] rounded-full h-1.5 overflow-hidden border border-[#00FF88]/10">
                    <div className={`${item.bar} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-4 space-y-8">

          {/* Status Bar (Compact Stats) */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onTabChange?.('courses')} className="bg-[#0A0F0A] border border-[#00FF88]/10 hover:border-[#00FF88]/30 p-4 rounded-xl cursor-pointer transition-all hover:bg-[#00FF88]/5">
              <p className="text-[10px] text-[#00B37A] uppercase tracking-wider mb-1">Courses</p>
              <p className="text-2xl font-bold text-white">{statsData.coursesCompleted}</p>
            </button>
            <button onClick={() => onTabChange?.('certificates')} className="bg-[#0A0F0A] border border-[#00FF88]/10 hover:border-[#00FF88]/30 p-4 rounded-xl cursor-pointer transition-all hover:bg-[#00FF88]/5">
              <p className="text-[10px] text-[#00B37A] uppercase tracking-wider mb-1">Certificates</p>
              <p className="text-2xl font-bold text-white">{statsData.certificatesEarned}</p>
            </button>
          </div>

          {/* Quick Commands */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest px-1">Quick Commands</h3>
            <button onClick={() => onTabChange?.('assessment')} className="w-full group bg-[#0A0F0A] hover:bg-[#00FF88]/5 border border-[#00FF88]/20 hover:border-[#00FF88]/50 p-4 rounded-xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]">
                  <Target className="h-4 w-4" />
                </div>
                <span className="font-bold text-[#EAEAEA] group-hover:text-white">Take Assessment</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#00B37A] group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onTabChange?.('certificates')} className="w-full group bg-[#0A0F0A] hover:bg-[#00FF88]/5 border border-[#00FF88]/20 hover:border-[#00FF88]/50 p-4 rounded-xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]">
                  <Award className="h-4 w-4" />
                </div>
                <span className="font-bold text-[#EAEAEA] group-hover:text-white">View Certificates</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#00B37A] group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onTabChange?.('notes')} className="w-full group bg-[#0A0F0A] hover:bg-[#00FF88]/5 border border-[#00FF88]/20 hover:border-[#00FF88]/50 p-4 rounded-xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-bold text-[#EAEAEA] group-hover:text-white">Personal Notes</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#00B37A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Intel Feed (Recent Activity) */}
          <Card variant="glass" className="border-[#00FF88]/10 bg-[#0A0F0A]">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-[#00B37A]">Intel Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="relative pl-6 pb-1 last:pb-0 border-l border-[#00FF88]/10 last:border-0">
                      <div className={`absolute -left-1.25 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-black ${activity.type === 'completion' ? 'bg-[#00FF88]' :
                        activity.type === 'start' ? 'bg-[#00CC66]' :
                          'bg-[#00B37A]'
                        }`} />
                      <div>
                        <p className="text-sm font-medium text-[#EAEAEA]">{activity.action}</p>
                        <p className="text-[10px] text-[#00B37A] font-mono mt-0.5">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#00B37A] text-sm italic">No recent intel.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};