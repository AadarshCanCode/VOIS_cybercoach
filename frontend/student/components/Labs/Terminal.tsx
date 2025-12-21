import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { CommandProcessor, CommandResult } from './engine/CommandProcessor';

interface TerminalProps {
    onCommand?: (command: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onCommand }) => {
    const [history, setHistory] = useState<Array<{ cmd: string; output: string; type: string }>>([]);
    const [currentLine, setCurrentLine] = useState('');
    const [processor] = useState(() => new CommandProcessor());
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Initial welcome message
        setHistory([{
            cmd: '',
            output: 'Cyber Coach Terminal v2.0\nType "help" for available commands.',
            type: 'info'
        }]);
    }, []);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const cmd = currentLine.trim();
            if (!cmd) return;

            if (cmd === 'clear') {
                setHistory([]);
                setCurrentLine('');
                return;
            }

            // Execute command
            const result: CommandResult = await processor.execute(cmd);

            setHistory(prev => [...prev, {
                cmd,
                output: result.output,
                type: result.type
            }]);

            setCurrentLine('');
            if (onCommand) onCommand(cmd);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevCmd = processor.getHistory('up');
            setCurrentLine(prevCmd);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextCmd = processor.getHistory('down');
            setCurrentLine(nextCmd);
        }
    };

    return (
        <div
            className="h-full bg-[#0A0F0A] font-mono text-sm flex flex-col border border-[#00FF88]/20 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.05)]"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Terminal Header */}
            <div className="bg-[#00FF88]/5 px-4 py-2 border-b border-[#00FF88]/10 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                    <TerminalIcon className="h-4 w-4 text-[#00FF88]" />
                    <span className="text-[#00FF88] font-bold tracking-wider text-xs">TERMINAL_ACCESS</span>
                </div>
                <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00FF88]/20 scrollbar-track-transparent">
                {history.map((entry, i) => (
                    <div key={i} className="mb-4 animate-fade-in">
                        {entry.cmd && (
                            <div className="flex items-center text-[#00FF88] mb-1">
                                <span className="mr-2">operator@cyber-coach:~$</span>
                                <span className="text-white">{entry.cmd}</span>
                            </div>
                        )}
                        <div className={`whitespace-pre-wrap leading-relaxed ${entry.type === 'error' ? 'text-red-400' :
                                entry.type === 'success' ? 'text-[#EAEAEA]' :
                                    entry.type === 'warning' ? 'text-yellow-400' :
                                        'text-[#00B37A]'
                            }`}>
                            {entry.output}
                        </div>
                    </div>
                ))}

                <div className="flex items-center text-[#00FF88]">
                    <span className="mr-2">operator@cyber-coach:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentLine}
                        onChange={(e) => setCurrentLine(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-white caret-[#00FF88]"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
