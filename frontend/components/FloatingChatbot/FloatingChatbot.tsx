import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Chatbot } from '../../student/components/Chatbot/Chatbot';
import { useLearningContext } from '@context/LearningContext';
import './FloatingChatbot.css';

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // We can let Chatbot handle its own minimized state if it supported it, 
  // but Chatbot.tsx only has isOpen/onClose. 
  // So we will just toggle it for now, similar to how it works in ModuleViewer.

  const { context } = useLearningContext();

  if (isOpen) {
    return <Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} context={context} />;
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="floating-chatbot-button"
      aria-label="Open chat assistant"
    >
      <Bot className="w-6 h-6" />
      <span className="chatbot-pulse"></span>
    </button>
  );
};
