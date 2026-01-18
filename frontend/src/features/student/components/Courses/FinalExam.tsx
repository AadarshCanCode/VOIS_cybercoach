import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { assessmentService } from '@services/assessmentService';
import { ragService } from '@services/ragService';
import { learningPathService } from '@services/learningPathService';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { useAuth } from '@context/AuthContext';

interface FinalExamProps {
  courseId: string;
  questions: { id: string; question: string; options: string[]; correctAnswer: number }[];
  onDone: (redoRecommendations: string[]) => void;
}

export const FinalExam: React.FC<FinalExamProps> = ({ courseId, questions, onDone }) => {
  const { user } = useAuth();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const q = questions[idx];

  const next = async () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[idx] = selected;
    setAnswers(newAnswers);
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setSelected(newAnswers[idx + 1] ?? null);
    } else {
      await submit(newAnswers);
    }
  };

  const submit = async (final = answers) => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const attempt = await assessmentService.startAttempt(user.id, 'final_exam');
      for (let i = 0; i < questions.length; i++) {
        const isCorrect = final[i] === questions[i].correctAnswer;
        await assessmentService.submitAnswer({
          attempt_id: attempt.id,
          user_id: user.id,
          question_id: `final:${questions[i].id}`,
          selected_answer: final[i],
          confidence_level: 3,
          is_correct: !!isCorrect,
          context: 'final_exam'
        });
      }
      const results = await assessmentService.getAttemptResults(attempt.id);
      const analysis = await ragService.analyzeAssessment(results);
      const gapTopics = analysis.gaps.map(g => g.topic);
      // Persist short memory summary
      await learnerMemoryService.upsertFacts(user.id, gapTopics.slice(0, 5).map(t => ({ kind: 'gap', topic: t, text: 'Needs reinforcement' })));
      // Suggest redo modules by topic names
      onDone(gapTopics);
      // Optionally enqueue targeted modules again
      await learningPathService.allocateInitialPath(user.id, courseId, analysis);
    } finally {
      setSubmitting(false);
    }
  };

  if (!q) return null;

  const score = answers.reduce((s, a, i) => (a === questions[i]?.correctAnswer ? s + 1 : s), 0);

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Final Exam</h2>
          <div className="text-sm text-gray-600">{idx + 1}/{questions.length}</div>
        </div>
        <p className="font-medium mb-4">{q.question}</p>
        <div className="space-y-2 mb-6">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)} className={`w-full text-left p-3 rounded border ${selected === i ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}>
              {opt}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Correct so far: {score}</span>
          </div>
          <button onClick={next} disabled={selected === null || submitting} className="px-6 py-2 bg-cyan-600 text-white rounded disabled:opacity-50">
            {idx === questions.length - 1 ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};


