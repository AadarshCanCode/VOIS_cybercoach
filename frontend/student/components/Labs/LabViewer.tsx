import React from 'react';
import { ArrowLeft, Clock, User, CheckCircle, ExternalLink, Play, Terminal, Shield, AlertTriangle } from 'lucide-react';
import { labs } from '@data/labs';
import { RealTimeLabEnvironment } from './RealTimeLabEnvironment';
import { VideoPlayer } from '../Video/VideoPlayer';

interface LabViewerProps {
  labId: string;
  onBack: () => void;
}

export const LabViewer: React.FC<LabViewerProps> = ({ labId, onBack }) => {
  const [showEnvironment, setShowEnvironment] = React.useState(false);
  const lab = labs.find(l => l.id === labId);

  const handleBack = () => {
    onBack();
  };

  if (!lab) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Terminal className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Lab Not Found</h2>
          <p className="text-[#00B37A] mb-6">The requested simulation does not exist.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] transition-colors"
          >
            Return to Labs
          </button>
        </div>
      </div>
    );
  }

  if (showEnvironment) {
    return (
      <RealTimeLabEnvironment
        labId={labId}
        labTitle={lab.title}
        onComplete={() => {
          lab.completed = true;
          setShowEnvironment(false);
        }}
        onBack={() => setShowEnvironment(false)}
      />
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10';
      case 'intermediate': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  const handleCompleteAfterwardsLab = () => {
    lab.completed = true;
    alert('Lab marked as completed!');
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-[#EAEAEA]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Simulations</span>
          </button>
          
          {lab.completed && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
              <CheckCircle className="h-5 w-5 text-[#00FF88]" />
              <span className="font-medium text-[#00FF88]">Mission Complete</span>
            </div>
          )}
        </div>

        {/* Lab Info Card */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                    <Terminal className="h-6 w-6 text-[#00FF88]" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">{lab.title}</h1>
                </div>
                <p className="text-[#00B37A] text-lg mb-6 max-w-2xl">{lab.description}</p>
                
                <div className="flex items-center space-x-6 text-sm font-mono">
                  <span className={`px-3 py-1 rounded border ${getDifficultyColor(lab.difficulty)} uppercase font-bold tracking-wider`}>
                    {lab.difficulty}
                  </span>
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <Clock className="h-4 w-4 text-[#00FF88]" />
                    <span>{lab.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <User className="h-4 w-4 text-[#00FF88]" />
                    <span>SOLO MISSION</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3 ml-6">
                <button
                  onClick={() => setShowEnvironment(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
                >
                  <Play className="h-5 w-5" />
                  <span>Launch Simulation</span>
                </button>
                {lab.liveUrl && (
                  <a
                    href={lab.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0A0F0A] border border-[#00FF88]/20 text-[#00FF88] font-bold rounded-lg hover:bg-[#00FF88]/10 transition-all"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>External Target</span>
                  </a>
                )}
              </div>
            </div>

            {/* Tools Required */}
            <div className="border-t border-[#00FF88]/10 pt-6">
              <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Required Arsenal</h3>
              <div className="flex flex-wrap gap-2">
                {lab.tools.map((tool, index) => (
                  <span key={index} className="bg-black/40 text-[#EAEAEA] px-4 py-2 rounded-lg border border-[#00FF88]/20 text-sm font-mono hover:border-[#00FF88]/40 transition-colors">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#00FF88]/10">
            <button 
              onClick={() => setShowEnvironment(true)}
              className="p-6 hover:bg-[#00FF88]/5 transition-colors border-r border-[#00FF88]/10 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                  <Terminal className="h-5 w-5 text-[#00FF88]" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-white">Lab Environment</h4>
                  <p className="text-[#00B37A] text-sm">Launch isolated sandbox</p>
                </div>
              </div>
            </button>
            
            <button className="p-6 hover:bg-[#00FF88]/5 transition-colors border-r border-[#00FF88]/10 group">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                  <Shield className="h-5 w-5 text-[#00FF88]" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-white">Documentation</h4>
                  <p className="text-[#00B37A] text-sm">Reference materials</p>
                </div>
              </div>
            </button>
            
            <button className="p-6 hover:bg-[#00FF88]/5 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                  <User className="h-5 w-5 text-[#00FF88]" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-white">Community</h4>
                  <p className="text-[#00B37A] text-sm">Get assistance</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-[#0A0F0A] rounded-xl border border-yellow-500/20 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500/5" />
          <div className="relative flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="font-bold text-yellow-500 uppercase tracking-wider mb-1">Security Protocol</h4>
              <p className="text-yellow-500/80 text-sm">
                Interact only with provided demo targets. Do not attack systems you do not own or have explicit permission to test.
                All activities are logged for training purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Embedded Sandbox */}
        {lab.liveUrl && (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
            <div className="p-4 border-b border-[#00FF88]/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-[#00FF88]" />
                <span>Embedded Sandbox</span>
              </h3>
              <span className="text-xs text-[#00B37A] font-mono">PROXY MODE</span>
            </div>
            <div className="bg-black">
              <iframe
                src={`http://localhost:5174/proxy?url=${encodeURIComponent(lab.liveUrl)}`}
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                className="w-full h-[500px]"
                title="Embedded Lab Target"
              />
            </div>
            <p className="text-xs text-[#00B37A]/60 p-3 font-mono">Embedded via local proxy. Only allowlisted demo domains are permitted.</p>
          </div>
        )}

        {/* Lab Instructions */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="p-4 border-b border-[#00FF88]/10">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#00FF88]" />
              <span>Mission Briefing</span>
            </h2>
          </div>
          
          {/* Lab Demo Video */}
          <div className="p-6 border-b border-[#00FF88]/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Play className="h-5 w-5 text-[#00FF88]" />
              <span>Demonstration Video</span>
            </h3>
            <VideoPlayer
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
              title={`${lab.title} - Demonstration`}
              onProgress={(progress) => console.log('Lab video progress:', progress)}
              onComplete={() => console.log('Lab video completed')}
            />
          </div>
          
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-[#EAEAEA] leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    let s = lab.instructions.replace(/\n/g, '<br/>');
                    s = s.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="bg-black/50 border border-[#00FF88]/20 p-4 rounded-lg mt-4 mb-4 overflow-x-auto font-mono text-sm text-[#00FF88]"><code>${code}</code></pre>`);
                    s = s.replace(/`([^`]+)`/g, (_m, code) => `<code class="bg-black/50 px-2 py-0.5 rounded text-[#00FF88] font-mono text-sm">${code}</code>`);
                    s = s.replace(/^# (.+)$/gm, (_m, title) => `<h1 class="text-2xl font-bold mb-4 mt-6 text-white">${title}</h1>`);
                    s = s.replace(/^## (.+)$/gm, (_m, title) => `<h2 class="text-xl font-bold mb-3 mt-6 text-white">${title}</h2>`);
                    s = s.replace(/^### (.+)$/gm, (_m, title) => `<h3 class="text-lg font-bold mb-2 mt-4 text-[#00FF88]">${title}</h3>`);
                    s = s.replace(/^- (.+)$/gm, (_m, item) => `<li class="ml-4 text-[#00B37A]">• ${item}</li>`);
                    s = s.replace(/^(\d+)\. (.+)$/gm, (_m, n, item) => `<li class="ml-4 text-[#00B37A]">${n}. ${item}</li>`);
                    return s;
                  })()
                }} 
              />
            </div>
          </div>
        </div>

        {/* Complete Lab Button */}
        {!lab.completed ? (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Mission Completion</h3>
                <p className="text-[#00B37A]">Mark this simulation as complete once you've finished all objectives.</p>
              </div>
              <button
                onClick={handleCompleteAfterwardsLab}
                className="px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
              >
                Complete Mission
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/20 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00FF88]/5" />
            <div className="relative flex items-center space-x-4">
              <div className="p-3 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
                <CheckCircle className="h-8 w-8 text-[#00FF88]" />
              </div>
              <div>
                <h3 className="font-bold text-[#00FF88] text-lg">Mission Accomplished!</h3>
                <p className="text-[#00B37A]">Outstanding work, operative. You've successfully completed this simulation.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};