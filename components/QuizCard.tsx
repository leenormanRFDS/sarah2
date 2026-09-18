'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Question } from '../data/questions';

type QuizCardProps = {
  question: Question;
  qIndex: number;
  total: number;
  selectedOptionId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
};

export default function QuizCard({ question, qIndex, total, selectedOptionId, onSelect, onNext }: QuizCardProps) {
  const [phase, setPhase] = useState<'IDLE' | 'LOCK' | 'CLAIM' | 'RESULT'>(selectedOptionId ? 'RESULT' : 'IDLE');

  // Reset phase when question changes
  useEffect(() => {
    setPhase(selectedOptionId ? 'RESULT' : 'IDLE');
  }, [question.id, selectedOptionId]);

  const handleSelect = (id: string) => {
    if (selectedOptionId || phase !== 'IDLE') return;
    onSelect(id);
    setPhase('LOCK');

    // 200ms lock answer
    setTimeout(() => {
      setPhase('CLAIM');
      
      // 500ms reveal claim
      setTimeout(() => {
        setPhase('RESULT');
        
        // Dwell before next
        const isQ20 = question.id === 20;
        const dwell = isQ20 ? 3000 : 1500;
        
        setTimeout(() => {
          onNext();
        }, dwell);
        
      }, 500);
    }, 200);
  };

  const isInvalid = question.researcherPrediction.state === 'INVALID';
  const isUnknown = question.researcherPrediction.state === 'UNKNOWN';
  
  let matchClass = 'uncertain';
  if (!isInvalid && !isUnknown && selectedOptionId) {
    matchClass = question.researcherPrediction.optionIds.includes(selectedOptionId) ? 'match' : 'mismatch';
  }

  // Calculate progress
  const progressPercent = Math.round(((qIndex) / total) * 100);

  // Subtle metadata based on progression
  let metadata = `RESEARCH CLAIM ${String(question.id).padStart(2, '0')} / ${total}`;
  if (question.id > 10) metadata = `OBSERVATIONAL CLAIM ${String(question.id).padStart(2, '0')} / ${total}`;
  if (question.id > 15) metadata = `BEHAVIOURAL RECORD ${String(question.id).padStart(2, '0')} / ${total}`;

  return (
    <>
      <div className="quiz-top">
        <span>{metadata}</span>
        <div className="progress-bar-container" style={{ width: '100px', height: '2px', background: '#eaeaea', marginTop: '4px' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#111', transition: 'width 0.3s' }} />
        </div>
      </div>
      <h2>{question.question}</h2>
      
      <div className="answers">
        {question.options.map(o => {
          const isSelected = selectedOptionId === o.id;
          const isDimmed = phase !== 'IDLE' && !isSelected;
          return (
            <button 
              key={o.id} 
              className={`${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}`} 
              onClick={() => handleSelect(o.id)} 
              disabled={!!selectedOptionId || phase !== 'IDLE'}
            >
              <span>{o.id}</span><strong>{o.label}</strong>
            </button>
          );
        })}
      </div>

      {(phase === 'CLAIM' || phase === 'RESULT') && (
        <motion.div className="prediction-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="reveal-row">
            <span>SUBJECT RESPONSE</span>
            <b>{question.options.find(o => o.id === selectedOptionId)?.label}</b>
          </div>
          
          <div className="reveal-row" style={{ marginTop: '16px' }}>
            <span>RESEARCHER CLAIM</span>
            <b>{question.researcherPrediction.display}</b>
          </div>
          
          {phase === 'RESULT' && (
            <motion.div className={`result-box ${matchClass}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="result-status">
                {isInvalid ? 'INVALID CLAIM' : isUnknown ? 'NEW INFORMATION' : matchClass === 'match' ? 'CONFIRMED' : 'REJECTED'}
              </div>
              <div className="result-reaction">
                {question.visibleReaction}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Fallback for manual progression if stuck */}
      {phase === 'RESULT' && (
        <button className="paper-button fallback-next" style={{ opacity: 0, animation: 'fadeIn 2s forwards 3s' }} onClick={onNext}>
          CONTINUE
        </button>
      )}
    </>
  );
}
