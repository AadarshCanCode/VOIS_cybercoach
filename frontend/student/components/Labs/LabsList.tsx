import { useState, useEffect, FC } from 'react';
import { FlaskRound as Flask, Clock, User, CheckCircle, ArrowRight, Terminal, Activity, Lock, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { CyberBackground } from '@/components/ui/cyber-background';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cyberLabs, nlpLabs } from '@data/labs';
import { useAuth } from '@context/AuthContext';
import { getCompletedLabs } from '@utils/labCompletion';
import { labApiService, LabStats } from '@services/labApiService';

interface LabsListProps {
  onLabSelect: (labId: string) => void;
}

export const LabsList: FC<LabsListProps> = ({ onLabSelect }) => {
  const { } = useAuth();
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [labStats, setLabStats] = useState<LabStats | null>(null);
  const [activeTab, setActiveTab] = useState<'cybersecurity' | 'nlp'>('cybersecurity');

  const allLabs = [...cyberLabs, ...nlpLabs];
  const visibleLabs = activeTab === 'cybersecurity' ? cyberLabs : nlpLabs;

  useEffect(() => {
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

  const renderLabGrid = (labs: any[]) => (
    <div className="grid gap-6">
      {labs.map((lab) => {
        const isProOnly = false; // Unlocked for everyone
        const isLocked = false; // Unlocked for everyone
        const isCompleted = completedLabs.includes(lab.id);

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: labs.indexOf(lab) * 0.1 }}
            key={lab.id}
            className={`bg-[#0A0F0A]/80 backdrop-blur-md rounded-xl border ${isLocked ? 'border-[#00FF88]/5 opacity-75' : 'border-[#00FF88]/20 hover:border-[#00FF88]/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]'} overflow-hidden transition-all duration-500 group relative`}
          >
            {/* Hover Glow */}
            {!isLocked && <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#00FF88]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}

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
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="relative p-6 min-h-screen text-[#EAEAEA] overflow-hidden">
      <CyberBackground />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10 pt-4">

        {/* Header with Typewriter/Glitch feel */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
              <Terminal className="h-6 w-6 text-[#00FF88]" />
              Virtual <span className="text-[#00FF88]">Simulations</span>
              <span className="animate-pulse w-3 h-8 bg-[#00FF88] inline-block ml-1"></span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-2 flex items-center">
              <span className="text-[#00FF88] mr-2">&gt;</span> DEPLOY ACTIVE COUNTERMEASURES
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-12 w-12 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]"
          >
            {activeTab === 'cybersecurity' ? <Flask className="h-6 w-6 text-[#00FF88]" /> : <Brain className="h-6 w-6 text-[#00FF88]" />}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#00FF88]/10 pb-1">
          <button
            onClick={() => setActiveTab('cybersecurity')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-px ${activeTab === 'cybersecurity'
              ? 'bg-[#00FF88]/10 border-t border-x border-[#00FF88] text-[#00FF88] border-b-black'
              : 'bg-transparent border border-transparent text-[#EAEAEA]/60 hover:text-[#EAEAEA] hover:bg-[#00FF88]/5'
              }`}
          >
            <Terminal className="h-5 w-5" />
            <span>Cybersecurity</span>
          </button>
          <button
            onClick={() => setActiveTab('nlp')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-px ${activeTab === 'nlp'
              ? 'bg-[#00FF88]/10 border-t border-x border-[#00FF88] text-[#00FF88] border-b-black'
              : 'bg-transparent border border-transparent text-[#EAEAEA]/60 hover:text-[#EAEAEA] hover:bg-[#00FF88]/5'
              }`}
          >
            <Brain className="h-5 w-5" />
            <span>NLP Experiments</span>
          </button>
        </div>

        {visibleLabs.length === 0 ? (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-12 text-center">
            <Terminal className="h-16 w-16 text-[#00FF88]/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Labs Available</h2>
            <p className="text-[#00B37A] max-w-md mx-auto">
              Lab simulations are currently being prepared. Check back soon for hands-on security training exercises.
            </p>
          </div>
        ) : (
          renderLabGrid(visibleLabs)
        )}

        {/* Lab Statistics - Only show if labs exist */}
        {allLabs.length > 0 && (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6 relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,136,0.02)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Activity className="h-5 w-5 text-[#00FF88]" />
              Simulation Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
                <div className="text-3xl font-bold text-[#00FF88] mb-1 font-mono">
                  <AnimatedCounter value={labStats?.completedLabs ?? completedLabs.length} />
                </div>
                <div className="text-[#00B37A] text-xs uppercase tracking-wider">Completed</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
                <div className="text-3xl font-bold text-yellow-400 mb-1 font-mono">
                  <AnimatedCounter value={labStats ? labStats.totalLabs - labStats.completedLabs : allLabs.length - completedLabs.length} />
                </div>
                <div className="text-[#00B37A] text-xs uppercase tracking-wider">Pending</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
                <div className="text-3xl font-bold text-[#00FF88] mb-1 font-mono">
                  <AnimatedCounter value={labStats ? Math.round(labStats.completionPercentage) : (allLabs.length > 0 ? Math.round((completedLabs.length / allLabs.length) * 100) : 0)} suffix="%" />
                </div>
                <div className="text-[#00B37A] text-xs uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg border border-[#00FF88]/10">
                <div className="text-3xl font-bold text-[#EAEAEA] mb-1 font-mono">
                  <AnimatedCounter prefix="~" value={allLabs.length * 60} />
                </div>
                <div className="text-[#00B37A] text-xs uppercase tracking-wider">Total Minutes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};