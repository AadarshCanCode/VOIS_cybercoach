import React, { useEffect, useState } from 'react';
import {
  Shield, Target, Award, Activity, Play, ChevronRight,
  Terminal, BookOpen, Clock, TrendingUp, Zap, FileText, StickyNote
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { supabase } from '@lib/supabase';
import { SEO } from '@/components/SEO/SEO';
import { studentService, StudentStats, RecentActivity, ActiveOperation } from '@services/studentService';
import { labApiService, LabStats } from '@services/labApiService';
import { formatDistanceToNow } from 'date-fns';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

/* ── Stat Card ───────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: string | number; icon: React.ReactNode;
  sub?: string; onClick?: () => void;
}> = ({ label, value, icon, sub, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col gap-3 rounded-xl border border-[#00ff88]/10 bg-[#0f1a0f] p-5 text-left transition-all duration-200 hover:border-[#00ff88]/30"
  >
    <div className="flex items-center justify-between">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00ff88]/10 text-[#00ff88]">
        {icon}
      </div>
      {sub && (
        <span className="flex items-center gap-1 text-xs font-semibold text-[#00ff88]">
          <TrendingUp className="h-3 w-3" /> {sub}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-[#4d7a4d]">{label}</p>
    </div>

  </button>
);

/* ── Pie Tooltip ─────────────────────────────────── */
const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#00ff88]/20 bg-[#0f1a0f] px-3 py-2 text-sm shadow-xl">
      <p className="font-semibold text-white">{payload[0].name}</p>
      <p className="text-[#00ff88]">{payload[0].value}%</p>
    </div>
  );
};

/* ── Dashboard ───────────────────────────────────── */
export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { user } = useAuth();

  const [statsData, setStatsData] = useState<StudentStats>({
    coursesCompleted: 0, assessmentScore: null,
    certificatesEarned: 0, liveLabsCompleted: 0, studyTime: '0 mins',
  });
  const [labStats, setLabStats] = useState<LabStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activeOperation, setActiveOperation] = useState<ActiveOperation | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [s, a, op, ls] = await Promise.all([
        studentService.getDashboardStats(user.id),
        studentService.getRecentActivity(user.id),
        studentService.getActiveOperation(user.id),
        labApiService.getLabStats().catch(() => ({ totalLabs: 6, completedLabs: 0, completionPercentage: 0, completedLabIds: [] })),
      ]);
      setStatsData(s); setActivities(a); setActiveOperation(op); setLabStats(ls);
    } catch {
      setLabStats({ totalLabs: 6, completedLabs: 0, completionPercentage: 0, completedLabIds: [] });
    }
  };

  useEffect(() => {
    loadData();
    if (!user?.id) return;
    const ch = supabase.channel('dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${user.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates', filter: `user_id=eq.${user.id}` }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  /* pie data */
  const labPct = labStats ? Math.round((labStats.completedLabs / labStats.totalLabs) * 100) : 0;
  const asmPct = user?.completedAssessment ? 100 : 0;
  const cPct = Math.min(100, statsData.coursesCompleted * 10);
  const rem = Math.max(0, 100 - Math.round((labPct + asmPct + cPct) / 3));

  const pieData = [
    { name: 'Labs', value: labPct || 1, color: '#00ff88' },
    { name: 'Assessment', value: asmPct || 1, color: '#00cc66' },
    { name: 'Courses', value: cPct || 1, color: '#009944' },
    { name: 'Remaining', value: rem, color: '#1a2e1a' },
  ];

  const quickActions = [
    { label: 'Take Assessment', icon: <Target className="h-4 w-4" />, tab: 'assessment' },
    { label: 'View Certificates', icon: <Award className="h-4 w-4" />, tab: 'certificates' },
    { label: 'My Notes', icon: <StickyNote className="h-4 w-4" />, tab: 'notes' },
    { label: 'Browse Courses', icon: <BookOpen className="h-4 w-4" />, tab: 'courses' },
  ];

  const progressBars = [
    { label: 'Labs', pct: labPct, detail: labStats ? `${labStats.completedLabs}/${labStats.totalLabs}` : `0/6`, color: '#00ff88' },
    { label: 'Assessment', pct: asmPct, detail: user?.completedAssessment ? 'Complete' : 'Pending', color: '#00cc66' },
    { label: 'Courses', pct: cPct, detail: `${statsData.coursesCompleted} done`, color: '#009944' },
  ];

  return (
    <div className="min-h-screen bg-[#060d06] p-6 space-y-6">
      <SEO title="Dashboard" description="CyberCoach student dashboard." />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="mt-0.5 text-sm text-[#4d7a4d]">Here's your cybersecurity training overview.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-[#00ff88]/15 bg-[#0f1a0f] px-3 py-2">
          <Shield className="h-4 w-4 text-[#00ff88]" />
          <span className="text-xs text-[#4d7a4d]">Level</span>
          <span className="text-xs font-bold text-[#00ff88]">{user?.level || 'Novice'}</span>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Courses Completed" value={statsData.coursesCompleted}
          icon={<BookOpen className="h-4 w-4" />} onClick={() => onTabChange?.('courses')} />
        <StatCard label="Labs Completed"
          value={labStats ? `${labStats.completedLabs}/${labStats.totalLabs}` : `0/6`}
          icon={<Terminal className="h-4 w-4" />}
          sub={labStats ? `${Math.round(labStats.completionPercentage)}%` : undefined}
          onClick={() => onTabChange?.('labs')} />
        <StatCard label="Certificates" value={statsData.certificatesEarned}
          icon={<Award className="h-4 w-4" />} onClick={() => onTabChange?.('certificates')} />
        <StatCard label="Study Time" value={statsData.studyTime}
          icon={<Clock className="h-4 w-4" />} />
      </div>

      {/* ── Main 2-col Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT col */}
        <div className="xl:col-span-8 space-y-6">

          {/* Current Course */}
          <div className="rounded-xl border border-[#00ff88]/15 bg-[#0f1a0f] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#00ff88]/10 px-5 py-4">
              <Zap className="h-4 w-4 text-[#00ff88]" />
              <span className="text-sm font-semibold text-white">Current Course</span>
            </div>
            <div className="p-5">
              {activeOperation ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#00ff88]">In Progress</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mb-1 truncate">{activeOperation.title}</h2>
                      <p className="text-sm text-[#4d7a4d] line-clamp-2">{activeOperation.description}</p>
                      <p className="text-xs text-[#4d7a4d] mt-1.5">
                        Module: <span className="text-[#99ddaa] font-medium">{activeOperation.currentModule}</span>
                      </p>
                    </div>
                    <div className="shrink-0 h-14 w-14 rounded-full border-2 border-[#00ff88]/25 bg-[#00ff88]/5 flex items-center justify-center">
                      <span className="text-lg font-bold text-[#00ff88]">{activeOperation.progress}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#4d7a4d]">
                      <span>Progress</span><span className="text-[#00ff88]">{activeOperation.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#1a2e1a] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00cc66] transition-all duration-700"
                        style={{ width: `${activeOperation.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => onTabChange?.('courses')}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#00ff88] hover:bg-[#00dd77] text-black font-bold py-2.5 px-4 text-sm transition-colors shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Resume Course
                    </button>
                    <button
                      onClick={() => onTabChange?.('labs')}
                      className="px-4 rounded-lg border border-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/10 transition-colors"
                    >
                      <Terminal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#00ff88]/8 border border-[#00ff88]/15 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-[#00ff88]/60" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-white mb-1">No active course</p>
                    <p className="text-sm text-[#4d7a4d]">Start a course to track your progress here.</p>
                  </div>
                  <button
                    onClick={() => onTabChange?.('courses')}
                    className="flex items-center gap-2 rounded-lg bg-[#00ff88] hover:bg-[#00dd77] text-black font-bold py-2.5 px-6 text-sm transition-colors"
                  >
                    <BookOpen className="h-4 w-4" /> Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview with Pie */}
          <div className="rounded-xl border border-[#00ff88]/15 bg-[#0f1a0f] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#00ff88]/10 px-5 py-4">
              <Activity className="h-4 w-4 text-[#00ff88]" />
              <span className="text-sm font-semibold text-white">Progress Overview</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                {/* Pie */}
                <div className="relative h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%"
                        innerRadius={56} outerRadius={84}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#00ff88]">{Math.round((labPct + asmPct + cPct) / 3)}%</p>
                      <p className="text-[10px] text-[#4d7a4d] font-medium uppercase tracking-wider">Overall</p>
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-5">
                  {progressBars.map((bar) => (
                    <div key={bar.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: bar.color, boxShadow: `0 0 6px ${bar.color}` }} />
                          <span className="font-medium text-white">{bar.label}</span>
                        </div>
                        <span className="text-xs text-[#4d7a4d]">{bar.detail}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#1a2e1a] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${bar.pct}%`, background: bar.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT col */}
        <div className="xl:col-span-4 space-y-6">

          {/* Quick Actions */}
          <div className="rounded-xl border border-[#00ff88]/15 bg-[#0f1a0f] overflow-hidden">
            <div className="border-b border-[#00ff88]/10 px-5 py-4">
              <span className="text-sm font-semibold text-white">Quick Actions</span>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map((a) => (
                <button
                  key={a.tab}
                  onClick={() => onTabChange?.(a.tab)}
                  className="w-full group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-[#00ff88]/5 text-[#99ddaa]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00ff88]/8 text-[#00ff88]">
                      {a.icon}
                    </div>
                    <span>{a.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#4d7a4d] group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-[#00ff88]/15 bg-[#0f1a0f] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#00ff88]/10 px-5 py-4">
              <FileText className="h-4 w-4 text-[#00ff88]" />
              <span className="text-sm font-semibold text-white">Recent Activity</span>
            </div>
            <div className="p-4 cc-scrollbar max-h-72 overflow-y-auto">
              {activities.length > 0 ? (
                <div className="space-y-0">
                  {activities.slice(0, 8).map((act, i) => {
                    let timeAgo = 'recently';
                    try { if (act.created_at) timeAgo = formatDistanceToNow(new Date(act.created_at), { addSuffix: true }); } catch { }
                    const isLast = i === Math.min(activities.length, 8) - 1;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center pt-1.5">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${act.type === 'completion' ? 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]'
                            : act.type === 'start' ? 'bg-[#00cc66]'
                              : 'bg-[#3d6b3d]'
                            }`} />
                          {!isLast && <div className="w-px flex-1 bg-[#1a2e1a] mt-1 mb-1 min-h-[20px]" />}
                        </div>
                        <div className="pb-3 min-w-0 flex-1">
                          <p className="text-sm text-[#ccffcc] font-medium truncate">{act.action}</p>
                          <p className="text-xs text-[#3d6b3d] mt-0.5">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Activity className="h-8 w-8 text-[#1a2e1a]" />
                  <div className="text-center">
                    <p className="text-sm text-[#4d7a4d] font-medium">No activity yet</p>
                    <p className="text-xs text-[#2d4a2d] mt-0.5">Start a course to get going!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};