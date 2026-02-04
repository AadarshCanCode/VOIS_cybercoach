import React, { useEffect, useState } from 'react';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfidenceHeatmapProps {
    userId: string;
}

interface KnowledgeNode {
    topic: string;
    confidence: number;
    last_updated: string;
}

export const ConfidenceHeatmap: React.FC<ConfidenceHeatmapProps> = ({ userId }) => {
    const [graph, setGraph] = useState<Record<string, { confidence: number; last_updated: string }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGraph();
    }, [userId]);

    const loadGraph = async () => {
        setLoading(true);
        const data = await learnerMemoryService.getKnowledgeGraph(userId);
        setGraph(data || {});
        setLoading(false);
    };

    const getColor = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/50 text-green-400';
        if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
        return 'bg-red-500/20 border-red-500/50 text-red-400';
    };

    const getIcon = (score: number) => {
        if (score >= 80) return <CheckCircle className="h-4 w-4" />;
        if (score >= 50) return <TrendingUp className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
    };

    const nodes = Object.entries(graph).map(([topic, data]) => ({
        topic,
        ...data
    })).sort((a, b) => b.confidence - a.confidence); // Highest confidence first

    if (loading) {
        return <div className="animate-pulse h-32 bg-gray-800/50 rounded-xl"></div>;
    }

    if (nodes.length === 0) {
        return (
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                <Brain className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-400 font-medium">No Knowledge Data Yet</h3>
                <p className="text-gray-600 text-sm mt-1">Interact with the AI Tutor to build your knowledge graph.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span>Neural Confidence Map</span>
                </h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{nodes.length} Topics Tracked</span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {nodes.map((node) => (
                    <div
                        key={node.topic}
                        className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm transition-all hover:scale-[1.02] ${getColor(node.confidence)}`}
                    >
                        <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-1">
                                {getIcon(node.confidence)}
                                <span className="font-medium truncate capitalize" title={node.topic}>{node.topic}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-1000 ${node.confidence >= 80 ? 'bg-green-500' :
                                            node.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${node.confidence}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold font-mono">{node.confidence}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
