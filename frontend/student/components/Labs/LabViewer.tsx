import React from 'react';
import { ArrowLeft, Clock, User, CheckCircle, ExternalLink, Play } from 'lucide-react';
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

  if (!lab) {
    return <div>Lab not found</div>;
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
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCompleteAfterwardsLab = () => {
    // Mark lab as completed
    lab.completed = true;
    alert('Lab marked as completed!');
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Labs</span>
          </button>
          
          {lab.completed && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Lab Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lab.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{lab.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className={`px-3 py-1 rounded-full border ${getDifficultyColor(lab.difficulty)}`}>
                  <span className="font-medium">{lab.difficulty.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{lab.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Individual Lab</span>
                </div>
              </div>
            </div>
            
            <div className="ml-6 flex items-center space-x-3">
              <button
                onClick={() => setShowEnvironment(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Start Live Lab</span>
              </button>
              {lab.liveUrl && (
                <a
                  href={lab.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Open Real Target</span>
                </a>
              )}
            </div>
          </div>

          {/* Tools Required */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Tools Required</h3>
            <div className="flex flex-wrap gap-2">
              {lab.tools.map((tool, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Lab Environment</h4>
              <p className="text-blue-700 text-sm mb-3">Access the isolated lab environment</p>
              <button 
                onClick={() => setShowEnvironment(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Launch Live Environment</span>
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Documentation</h4>
              <p className="text-green-700 text-sm mb-3">Reference materials and guides</p>
              <button className="flex items-center space-x-1 text-green-600 hover:text-green-800">
                <ExternalLink className="h-4 w-4" />
                <span>View Docs</span>
              </button>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Community</h4>
              <p className="text-purple-700 text-sm mb-3">Get help from other learners</p>
              <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-800">
                <ExternalLink className="h-4 w-4" />
                <span>Join Discussion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lab Instructions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="p-4 mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
            <strong>Safety Notice:</strong> Interact only with provided demo targets. Do not attack systems you do not own or have explicit permission to test.
          </div>

          {lab.liveUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Embedded Sandbox (Proxy)</h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <iframe
                  src={`http://localhost:5174/proxy?url=${encodeURIComponent(lab.liveUrl)}`}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                  className="w-full h-[600px] bg-white"
                  title="Embedded Lab Target"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Embedded via local proxy. Only allowlisted demo domains are permitted.</p>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lab Instructions</h2>
          
          {/* Lab Demo Video */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lab Demonstration Video</h3>
            <VideoPlayer
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
              title={`${lab.title} - Demonstration`}
              onProgress={(progress) => console.log('Lab video progress:', progress)}
              onComplete={() => console.log('Lab video completed')}
            />
          </div>
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: (() => {
                let s = lab.instructions.replace(/\n/g, '<br/>');
                s = s.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="bg-gray-100 p-4 rounded mt-4 mb-4 overflow-x-auto"><code>${code}</code></pre>`);
                s = s.replace(/`([^`]+)`/g, (_m, code) => `<code class="bg-gray-100 px-1 rounded">${code}</code>`);
                s = s.replace(/^# (.+)$/gm, (_m, title) => `<h1 class="text-2xl font-bold mb-4 mt-6">${title}</h1>`);
                s = s.replace(/^## (.+)$/gm, (_m, title) => `<h2 class="text-xl font-bold mb-3 mt-6">${title}</h2>`);
                s = s.replace(/^### (.+)$/gm, (_m, title) => `<h3 class="text-lg font-bold mb-2 mt-4">${title}</h3>`);
                s = s.replace(/^- (.+)$/gm, (_m, item) => `<li class="ml-4">${item}</li>`);
                s = s.replace(/^(\d+)\. (.+)$/gm, (_m, _n, item) => `<li class="ml-4">${item}</li>`);
                return s;
              })()
            }} />
          </div>
        </div>

        {/* Complete Lab Button */}
        {!lab.completed && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Ready to complete this lab?</h3>
                <p className="text-gray-600">Mark this lab as complete once you've finished all exercises.</p>
              </div>
              <button
                onClick={handleCompleteAfterwardsLab}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        )}

        {/* Completed Status */}
        {lab.completed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-bold text-green-800">Lab Completed!</h3>
                <p className="text-green-700">Great job! You've successfully completed this hands-on lab.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};