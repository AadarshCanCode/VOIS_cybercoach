import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LearningContextType {
    context: {
        courseTitle?: string;
        moduleTitle?: string;
        moduleContent?: string;
    } | null;
    setContext: (context: { courseTitle?: string; moduleTitle?: string; moduleContent?: string; } | null) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [context, setContext] = useState<LearningContextType['context']>(null);

    return (
        <LearningContext.Provider value={{ context, setContext }}>
            {children}
        </LearningContext.Provider>
    );
};

export const useLearningContext = () => {
    const context = useContext(LearningContext);
    if (context === undefined) {
        throw new Error('useLearningContext must be used within a LearningProvider');
    }
    return context;
};
