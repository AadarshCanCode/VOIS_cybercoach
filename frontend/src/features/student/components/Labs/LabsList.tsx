import React from 'react';
import { FlaskRound as Flask, Clock, User, CheckCircle, ArrowRight, Terminal, Activity, Lock } from 'lucide-react';
import { labs } from '@data/labs';
import { useAuth } from '@context/AuthContext';
import { getCompletedLabs } from '@utils/labCompletion';
import { labApiService, LabStats } from '@services/labApiService';

interface LabsListProps {
  onLabSelect: (labId: string) => void;
}

export const LabsList: React.FC<LabsListProps> = ({ onLabSelect }) => {
  const { user } = useAuth();
  const [completedLabs, setCompletedLabs] = React.useState<string[]>([]);
  const [labStats, setLabStats] = React.useState<LabStats | null>(null);

  React.useEffect(() => {
    // First, load from localStorage
    setCompletedLabs(getCompletedLabs());

    // Then fetch from API
    const loadLabStats = async () => {
      try {
        const stats = await labApiService.getLabStats();
        setLabStats(stats);
        setCompletedLabs(stats.completedLabIds);
      } catch (error) {
        console.error('Error fetching lab stats:', error);
        // Fall back to localStorage if API fails
        setCompletedLabs(getCompletedLabs());
      }
    };

    loadLabStats();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Virtual <span className="text-[#00FF88]">Simulations</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">DEPLOY ACTIVE COUNTERMEASURES</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <Flask className="h-5 w-5 text-[#00FF88]" />
          </div>
        </div>

        {labs.length === 0 ? (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-12 text-center">
            <Terminal className="h-16 w-16 text-[#00FF88]/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Labs Available</h2>
            <p className="text-[#00B37A] max-w-md mx-auto">
              Lab simulations are currently being prepared. Check back soon for hands-on security training exercises.
            </p>
          </div>
        ) : (
        <>
        <div className="grid gap-6">
          {labs.map((lab) => {
            const isProOnly = lab.difficulty === 'advanced';
            const isLocked = isProOnly && (user as any)?.subscription_tier !== 'pro';
            const isCompleted = completedLabs.includes(lab.id);

            return (
              <div key={lab.id} className={`bg-[#0A0F0A] rounded-xl border ${isLocked ? 'border-[#00FF88]/5 opacity-75' : 'border-[#00FF88]/10 hover:border-[#00FF88]/30'} overflow-hidden transition-all duration-300 group relative`}>
                {/* Hover Glow */}
                {!isLocked && <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />}

                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded ${isLocked ? 'bg-gray-800 border-gray-700' : 'bg-[#00FF88]/10 border-[#00FF88]/20'} border`}>
                          {isLocked ? <Lock className="h-5 w-5 text-gray-500" /> : <Terminal className="h-5 w-5 text-[#00FF88]" />}
                        </div>
                        <h2 className={`text-xl font-bold ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-[#00FF88]'} transition-colors tracking-tight`}>{lab.title}</h2>
                        {isCompleted && (
                          <div className="px-2 py-0.5 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </div>
                        )}
                        {isProOnly && (
                          <div className="px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            PRO REQUIRED
                          </div>
                        )}
                      </div>
                      <p className="text-[#00B37A] mb-6 max-w-2xl">{lab.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-[#EAEAEA]/60 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(lab.difficulty)}`}>
                            {lab.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-[#00FF88]" />
                          <span>{lab.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-[#00FF88]" />
                          <span>SOLO MISSION</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-[#00FF88]/10">
                        <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-3">Required Tools</h3>
                        <div className="flex flex-wrap gap-2">
                          {lab.tools.map((tool: string, index: number) => (
                            <span key={index} className="bg-[#0A0F0A] text-[#EAEAEA] px-3 py-1 rounded border border-[#00FF88]/20 text-xs font-mono group-hover:border-[#00FF88]/40 transition-colors">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => !isLocked && onLabSelect(lab.id)}
                      disabled={isLocked}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 ml-6 ${isLocked
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        : isCompleted
                          ? 'bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20 border border-[#00FF88]/20'
                          : 'bg-[#00FF88] text-black hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                        }`}
                    >
                      {isLocked ? <Lock className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                      <span>{isLocked ? 'LOCKED' : isCompleted ? 'REVIEW LOGS' : 'DEPLOY LAB'}</span>
                      {!isLocked && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}

        {/* Lab Statistics - Only show if labs exist */}
        {labs.length > 0 && (
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,136,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Activity className="h-5 w-5 text-[#00FF88]" />
            Simulation Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
              <div className="text-3xl font-bold text-[#00FF88] mb-1 font-mono">{labStats?.completedLabs ?? completedLabs.length}</div>
              <div className="text-[#00B37A] text-xs uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
              <div className="text-3xl font-bold text-yellow-400 mb-1 font-mono">{labStats ? labStats.totalLabs - labStats.completedLabs : labs.length - completedLabs.length}</div>
              <div className="text-[#00B37A] text-xs uppercase tracking-wider">Pending</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
              <div className="text-3xl font-bold text-[#00FF88] mb-1 font-mono">{labStats ? Math.round(labStats.completionPercentage) : (labs.length > 0 ? Math.round((completedLabs.length / labs.length) * 100) : 0)}%</div>
              <div className="text-[#00B37A] text-xs uppercase tracking-wider">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
              <div className="text-3xl font-bold text-[#EAEAEA] mb-1 font-mono">~{labs.length * 60}</div>
              <div className="text-[#00B37A] text-xs uppercase tracking-wider">Total Minutes</div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};