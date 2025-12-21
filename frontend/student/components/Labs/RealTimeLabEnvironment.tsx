import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, Zap } from 'lucide-react';
import { Terminal } from './Terminal';
import { TargetBrowser } from './TargetBrowser';

interface LabEnvironmentProps {
  labId: string;
  labTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

export const RealTimeLabEnvironment: React.FC<LabEnvironmentProps> = ({ labTitle, onBack }) => {
  const [status, setStatus] = useState<'running' | 'starting' | 'stopped'>('running');

  const handleReset = () => {
    setStatus('starting');
    setTimeout(() => setStatus('running'), 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#EAEAEA] overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0F0A] border-b border-[#00FF88]/10 p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-800" />
          <h1 className="text-lg font-bold text-white tracking-tight">{labTitle}</h1>
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 ${status === 'running' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20' :
              status === 'starting' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
            <Zap className="h-3 w-3" />
            <span>{status}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#0A0F0A] hover:bg-[#1A1F1A] border border-gray-800 rounded text-sm transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Environment</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-1.5 bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold rounded text-sm transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Flag</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Target System (Browser) */}
        <div className="w-1/2 p-4 flex flex-col border-r border-[#00FF88]/10 bg-[#050505]">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target System</h2>
            <span className="text-xs text-gray-600 font-mono">192.168.1.10</span>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-black">
            <TargetBrowser initialUrl="http://vulnerable-bank.lab:8080" />
          </div>
        </div>

        {/* Right: Attack Terminal */}
        <div className="w-1/2 p-4 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Command Center</h2>
            <span className="text-xs text-gray-600 font-mono">10.10.14.5</span>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden shadow-2xl">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
};