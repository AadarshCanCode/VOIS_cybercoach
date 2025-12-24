import React, { useState, useEffect } from 'react';
import { Terminal, ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';
import { labs } from '@data/labs';
import { isLabCompleted, markLabAsCompleted } from '@utils/labCompletion';
import { labApiService } from '@services/labApiService';

interface LabViewerProps {
  labId: string;
  onBack: () => void;
}

export const LabViewer: React.FC<LabViewerProps> = ({ labId, onBack }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  useEffect(() => {
    setIsCompleted(isLabCompleted(labId));
  }, [labId]);

  const handleMarkAsCompleted = async () => {
    try {
      // Mark in localStorage for offline support
      markLabAsCompleted(labId);
      
      // Also save to database
      await labApiService.markLabAsCompleted(labId);
      
      setIsCompleted(true);
      setShowCompletionMessage(true);
      setTimeout(() => setShowCompletionMessage(false), 3000);
    } catch (error) {
      console.error('Error marking lab as completed:', error);
      // Still mark as completed locally even if API fails
      setIsCompleted(true);
      setShowCompletionMessage(true);
      setTimeout(() => setShowCompletionMessage(false), 3000);
    }
  };

  const lab = labs.find((l) => l.id === labId);
  
  if (!lab) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Terminal className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Lab Not Found</h2>
          <p className="text-[#00B37A] mb-6">Lab simulations are currently being prepared. Check back soon.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] transition-colors"
          >
            Return to Labs
          </button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88] bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Labs</span>
        </button>

        {/* Lab Header Card */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                    <Terminal className="h-6 w-6 text-[#00FF88]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{lab.title}</h1>
                    <p className="text-[#00B37A] font-mono text-sm mt-1">THEORETICAL TRAINING</p>
                  </div>
                </div>
                <p className="text-[#EAEAEA] text-lg mb-6">{lab.description}</p>

                <div className="flex items-center space-x-6 text-sm font-mono flex-wrap gap-4">
                  <span className={`px-3 py-1 rounded border ${getDifficultyColor(lab.difficulty)} uppercase font-bold tracking-wider`}>
                    {lab.difficulty}
                  </span>
                  <div className="text-[#00B37A]">
                    <span className="text-[#00FF88]">⏱</span> {lab.estimatedTime}
                  </div>
                  <div className="text-[#00B37A]">
                    <span className="text-[#00FF88]">🛠</span> {lab.tools.join(', ')}
                  </div>
                </div>
              </div>

              {/* Launch Lab Button */}
              <a
                href={lab.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all ml-6 whitespace-nowrap"
              >
                <span>Launch Lab</span>
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Theory Section */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="p-6 border-b border-[#00FF88]/10">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-[#00FF88]" />
              <span>Learning Materials</span>
            </h2>
          </div>

          <div className="p-8">
            <div className="prose prose-invert max-w-none text-[#EAEAEA]">
              <div
                className="space-y-4 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    let s = lab.instructions.replace(/\n/g, '<br/>');
                    s = s.replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-6 mb-4">$1</h2>');
                    s = s.replace(/^## (.+)$/gm, '<h3 class="text-xl font-bold text-[#00FF88] mt-5 mb-3">$1</h3>');
                    s = s.replace(/^- (.+)$/gm, '<li class="ml-6 text-[#EAEAEA] mb-2">• $1</li>');
                    s = s.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 text-[#EAEAEA] mb-2">$1. $2</li>');
                    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#00FF88] font-bold">$1</strong>');
                    return s;
                  })()
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-[#00FF88]" />
            <span>Lab Environment</span>
          </h3>
          <p className="text-[#00B37A] mb-6">
            Ready to apply what you've learned? Click the button below to access the live lab environment where you can practice hands-on exploitation techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a
              href={lab.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
            >
              <span>Launch Lab Environment</span>
              <ExternalLink className="h-5 w-5" />
            </a>
            
            {isCompleted ? (
              <button
                disabled
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00FF88]/20 text-[#00FF88] font-bold rounded-lg border border-[#00FF88]/40 cursor-default"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Lab Completed</span>
              </button>
            ) : (
              <button
                onClick={handleMarkAsCompleted}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Mark as Completed</span>
              </button>
            )}
          </div>

          {showCompletionMessage && (
            <div className="mt-4 p-4 bg-green-600/20 border border-green-600/40 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400">✓ Lab marked as completed!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};