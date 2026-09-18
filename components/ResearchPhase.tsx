'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { questions } from '../data/questions';
import { timeline } from '../data/timeline';
import { profile } from '../data/profile';
import { buildModelVector, calculateResearcherScore, predict, testQuestions } from '../lib/model';
import { forecast } from '../data/forecast';
import QuizCard from './QuizCard';

type Props = { onReveal?: () => void };

type Stage = 'INTRO' | 'LOADING' | 'TIMELINE' | 'PROFILE' | 'TRAINING_INTRO' | 'QUIZ' | 'RESEARCHER_RESULT' | 'SARAH_REVEAL' | 'MODEL_TEST' | 'MODEL_TEST_RESULT' | 'FORECAST' | 'FINAL_ASSESSMENT' | 'Q30' | 'GIFT' | 'BIRTHDAY' | 'RESPONSIBLE';

interface AppState {
  stage: Stage;
  loadIndex: number;
  qIndex: number;
  responses: Record<number, string>;
  testIndex: number;
  testPredictions: Record<string, string>;
  testAnswers: Record<string, string>;
  q30: string | null;
  gift: boolean;
  responsibleBroken: boolean;
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'SET_STAGE'; stage: Stage }
  | { type: 'ADVANCE_LOADING' }
  | { type: 'CHOOSE_ANSWER'; qId: number; optionId: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'START_TEST'; predictionId: string, prediction: string }
  | { type: 'CHOOSE_TEST_ANSWER'; testId: string, optionId: string }
  | { type: 'NEXT_TEST'; nextPredictionId?: string, nextPrediction?: string }
  | { type: 'SET_Q30'; value: string }
  | { type: 'SET_GIFT'; value: boolean }
  | { type: 'SET_RESPONSIBLE_BROKEN'; value: boolean };

const initialState: AppState = {
  stage: 'INTRO',
  loadIndex: 0,
  qIndex: 0,
  responses: {},
  testIndex: 0,
  testPredictions: {},
  testAnswers: {},
  q30: null,
  gift: false,
  responsibleBroken: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_STAGE':
      return { ...state, stage: action.stage };
    case 'ADVANCE_LOADING':
      return { ...state, loadIndex: state.loadIndex + 1 };
    case 'CHOOSE_ANSWER':
      return {
        ...state,
        responses: { ...state.responses, [action.qId]: action.optionId }
      };
    case 'NEXT_QUESTION':
      if (state.qIndex < questions.length - 1) {
        return { ...state, qIndex: state.qIndex + 1 };
      }
      return { ...state, stage: 'RESEARCHER_RESULT' };
    case 'START_TEST':
      return {
        ...state,
        stage: 'MODEL_TEST',
        testIndex: 0,
        testPredictions: { ...state.testPredictions, [action.predictionId]: action.prediction }
      };
    case 'CHOOSE_TEST_ANSWER':
      if (state.testAnswers[action.testId]) return state;
      return {
        ...state,
        testAnswers: { ...state.testAnswers, [action.testId]: action.optionId }
      };
    case 'NEXT_TEST':
      if (state.testIndex < testQuestions.length - 1) {
        return {
          ...state,
          testIndex: state.testIndex + 1,
          testPredictions: action.nextPredictionId && action.nextPrediction ? 
            { ...state.testPredictions, [action.nextPredictionId]: action.nextPrediction } : 
            state.testPredictions
        };
      }
      return { ...state, stage: 'MODEL_TEST_RESULT' };
    case 'SET_Q30':
      if (state.q30) return state;
      return { ...state, q30: action.value };
    case 'SET_GIFT':
      return { ...state, gift: action.value };
    case 'SET_RESPONSIBLE_BROKEN':
      return { ...state, responsibleBroken: action.value };
    default:
      return state;
  }
}

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45 } }, exit: { opacity: 0, y: -10, transition: { duration: 0.3 } } };

export default function ResearchPhase({ onReveal }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [futureImageErrors, setFutureImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sarah-birthday-v2');
      if (raw) {
        const saved = JSON.parse(raw);
        dispatch({ type: 'HYDRATE', payload: saved });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const { stage, qIndex, responses, testPredictions, testAnswers, q30 } = state;
    const save = { stage, qIndex, responses, testPredictions, testAnswers, q30 };
    try { localStorage.setItem('sarah-birthday-v2', JSON.stringify(save)); } catch {}
  }, [state.stage, state.qIndex, state.responses, state.testPredictions, state.testAnswers, state.q30]);

  const model = useMemo(() => buildModelVector(state.responses), [state.responses]);
  const score = useMemo(() => calculateResearcherScore(state.responses), [state.responses]);
  const currentQuestion = questions[state.qIndex];

  useEffect(() => {
    if (state.stage !== 'LOADING') return;
    if (state.loadIndex < 4) {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_LOADING' }), 850);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => dispatch({ type: 'SET_STAGE', stage: 'TIMELINE' }), 700);
    return () => clearTimeout(t);
  }, [state.stage, state.loadIndex]);

  const testIndex = state.testIndex;
  const currentTest = testQuestions[testIndex];

  const handleTestPrediction = () => {
    const predicted = predict(testQuestions[0], model);
    dispatch({ type: 'START_TEST', predictionId: testQuestions[0].id, prediction: predicted });
  };

  if (!mounted) return null;

  return <div className="research-shell">
    {state.stage !== 'SARAH_REVEAL' && state.stage !== 'Q30' && state.stage !== 'GIFT' && state.stage !== 'BIRTHDAY' && (
      <div className="topline"><span>CASE 30–172 / SARAH</span><span>RESEARCH STATUS / {state.stage}</span></div>
    )}
    <main>
      <AnimatePresence mode="wait">
      {state.stage === 'INTRO' && <motion.section className="paper-page cover" {...fade} key="intro">
        <div className="case-mark">CASE 30–172</div>
        <div className="cover-kicker">THE</div><h1>SARAH<br/>BRAND BIBLE™</h1>
        <p className="serif-lede">A 172-day study of one woman, several assumptions, and very little retained information.</p>
        <div className="meta-grid"><span>SUBJECT</span><b>Sarah Hyland</b><span>AGE</span><b>30</b><span>RESEARCH COMMENCED</span><b>30.03.2026</b><span>RESEARCH PERIOD</span><b>172 DAYS</b><span>METHODOLOGY</span><b>Observation / assumption / vibes</b><span>PRIMARY RESEARCHER</span><b>Classified</b></div>
        <button className="paper-button" onClick={() => { dispatch({ type: 'SET_STAGE', stage: 'LOADING' }) }}>BEGIN INVESTIGATION</button>
      </motion.section>}

      {state.stage === 'LOADING' && <motion.section className="paper-page loading-page" key="loading" {...fade}><div className="system-stack">
        {['INITIALISING SUBJECT PROFILE…', 'RECOVERING HISTORICAL DATA…', 'RECONSTRUCTING RESEARCHER MEMORY…', 'CROSS-REFERENCING 172 DAYS OF OBSERVATION…'].slice(0, state.loadIndex + 1).map((x, i) => <motion.div key={`load-${i}`} {...fade} className="mono-line">{x}</motion.div>)}
        {state.loadIndex >= 4 && <motion.div {...fade} className="failure">MEMORY RECOVERY FAILED.</motion.div>}
        {state.loadIndex >= 4 && <motion.div {...fade} className="mono-line">PROCEEDING REGARDLESS.</motion.div>}
      </div></motion.section>}

      {state.stage === 'TIMELINE' && <motion.section className="paper-page" {...fade} key="timeline"><div className="section-kicker">03 / THE FIRST 172 DAYS</div><h2>The researcher remembers in instalments.</h2><div className="timeline">{timeline.map((e, i) => <div className="timeline-row" key={`${e.day}-${i}`}><div className="timeline-day">DAY {e.day}</div><div className="timeline-card"><h3>{e.title}</h3><p>{e.detail}</p><div className="forgot">{e.forgot}</div></div></div>)}</div><button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'PROFILE' })}>CONTINUE</button></motion.section>}

      {state.stage === 'PROFILE' && <motion.section className="paper-page" {...fade} key="profile"><div className="section-kicker">04 / CURRENT SUBJECT PROFILE</div><h2>Known variables.</h2><div className="profile-layout"><div className="profile-list">{profile.map(([v, t], i) => <div className="profile-row" key={`prof-${i}`}><span>{t}</span><strong>{v}</strong></div>)}</div><div className="diagnostics"><div><span>INFORMATION ACQUIRED</span><b>71%</b><i><em style={{ width: '71%' }} /></i></div><div><span>INFORMATION RETAINED</span><b>18%</b><i><em style={{ width: '18%' }} /></i></div><div><span>INFORMATION FORGOTTEN</span><b>82%</b><i><em style={{ width: '82%' }} /></i></div><div><span>CONFIDENCE WHILE WRONG</span><b>94%</b><i><em style={{ width: '94%' }} /></i></div></div></div><div className="small-note">RESEARCHER NOTE / Current human memory architecture has reached its practical limit.</div><button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'TRAINING_INTRO' })}>VERIFY RESEARCH</button></motion.section>}

      {state.stage === 'TRAINING_INTRO' && <motion.section className="paper-page center-page" {...fade} key="training-intro"><div className="section-kicker">05 / VERIFICATION PROTOCOL</div><div className="mega">20 QUESTIONS<br/>30 YEARS<br/>ONE RESEARCHER</div><p className="serif-lede">172 days of research have produced a concerning number of claims about Sarah.</p><p className="serif-lede">Twenty require independent verification.</p><button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'QUIZ' })}>BEGIN FACT CHECK</button></motion.section>}

      {state.stage === 'QUIZ' && currentQuestion && (
        <motion.section className="paper-page quiz-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} key={currentQuestion.id}>
          <QuizCard 
            question={currentQuestion}
            qIndex={state.qIndex}
            total={questions.length}
            selectedOptionId={state.responses[currentQuestion.id] || null}
            onSelect={(optId) => dispatch({ type: 'CHOOSE_ANSWER', qId: currentQuestion.id, optionId: optId })}
            onNext={() => dispatch({ type: 'NEXT_QUESTION' })}
          />
        </motion.section>
      )}

      {state.stage === 'RESEARCHER_RESULT' && (
        <motion.section className="paper-page center-page" {...fade} key="result">
          <ResearcherResult score={score} onComplete={() => dispatch({ type: 'SET_STAGE', stage: 'SARAH_REVEAL' })} />
        </motion.section>
      )}

      {state.stage === 'SARAH_REVEAL' && (
        <motion.section className="startup-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} key="reveal">
          <SarahReveal onContinue={handleTestPrediction} />
        </motion.section>
      )}

      {state.stage === 'MODEL_TEST' && currentTest && <motion.section className="paper-page quiz-page" {...fade} key={currentTest.id}>
        <div className="quiz-top"><span>SARAH / {currentTest.id} / LOCKED</span><span>UNSEEN TEST {testIndex + 1} / {testQuestions.length}</span></div>
        <div className="section-kicker">PREDICTION SEALED.</div>
        <h2>{currentTest.question}</h2>
        <div className="answers">{currentTest.options.map((o, i) => <button key={`testopt-${o.id}-${i}`} className={state.testAnswers[currentTest.id] === o.id ? 'selected' : ''} onClick={() => dispatch({ type: 'CHOOSE_TEST_ANSWER', testId: currentTest.id, optionId: o.id })} disabled={!!state.testAnswers[currentTest.id]}><span>{o.id}</span><strong>{o.label}</strong></button>)}</div>
        {state.testAnswers[currentTest.id] && <div className="prediction-reveal">
          <div className="reveal-row">
            <span>SARAH™ PREDICTED</span>
            <b>{currentTest.options.find(o => o.id === state.testPredictions[currentTest.id])?.label}</b>
          </div>
          <div className={`result-box ${state.testAnswers[currentTest.id] === state.testPredictions[currentTest.id] ? 'match' : 'mismatch'}`} style={{marginTop: '25px'}}>
            <div className="result-status">
              {state.testAnswers[currentTest.id] === state.testPredictions[currentTest.id] ? 'MODEL CONFIRMED' : 'MODEL ERROR'}
            </div>
          </div>
        </div>}
        {state.testAnswers[currentTest.id] && <button className="paper-button" style={{marginTop: '30px'}} onClick={() => {
          let nextPredictionId;
          let nextPrediction;
          if (testIndex < testQuestions.length - 1) {
            nextPredictionId = testQuestions[testIndex + 1].id;
            nextPrediction = predict(testQuestions[testIndex + 1], model);
          }
          dispatch({ type: 'NEXT_TEST', nextPredictionId, nextPrediction });
        }}>NEXT</button>}
      </motion.section>}

      {state.stage === 'MODEL_TEST_RESULT' && (() => {
         let confirmed = 0;
         testQuestions.forEach(t => {
           if (state.testAnswers[t.id] === state.testPredictions[t.id]) confirmed++;
         });
         return <motion.section className="paper-page center-page" {...fade} key="model-result">
           <div className="section-kicker">MODEL COMPLETE</div>
           <div style={{height: '20px'}}/>
           <h2>SARAH™ PERFORMANCE</h2>
           <div className="mega-small">{confirmed} / 3 PREDICTIONS CONFIRMED</div>
           <div style={{height: '10px'}}/>
           <p className="serif-lede">
             {confirmed === 3 ? '172 DAYS OF HUMAN OBSERVATION HAS BEEN FORMALLY OUTPERFORMED. RESEARCHER POSITION UNDER REVIEW.' : 
              confirmed === 2 ? 'AN UNCOMFORTABLE LEVEL OF FAMILIARITY HAS BEEN ACHIEVED.' :
              confirmed === 1 ? 'EARLY MODEL PERFORMANCE: INCONCLUSIVE. RESEARCHER EMPLOYMENT TEMPORARILY SECURE.' :
              'PREDICTIVE PERFORMANCE: CATASTROPHIC. HUMAN EMPLOYMENT SAFE FOR ANOTHER QUARTER.'}
           </p>
           <button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'FORECAST' })} style={{marginTop: '40px'}}>CONTINUE TO FORECAST</button>
         </motion.section>;
      })()}

      {state.stage === 'FORECAST' && <motion.section className="paper-page forecast-page" {...fade} key="forecast"><div className="section-kicker">09 / PREDICTIVE HUMAN CONTEXT™</div><h2>SARAH™ doesn’t just remember the past.<br/><em>It models what comes next.</em></h2><div className="forecast-stack">{forecast.map((f, i) => <article className="forecast-plate" key={`fore-${f.age}-${i}`}><div className="plate-meta"><b>SUBJECT AGE — {f.age}</b><span>TEMPORAL OFFSET — +{f.age - 30} YEARS</span><span>FORECAST RELIABILITY — QUESTIONABLE</span></div>{futureImageErrors[f.age] ? <div className="image-placeholder"><span>FORECAST PLATE {String(i + 1).padStart(2, '0')}</span><b>IMAGE ASSET NOT PRESENT</b><small>Drop /public/images/sarah-{f.age}.jpg into the project.</small></div> : <img src={f.src} alt={`Sarah forecast at age ${f.age}`} onError={() => setFutureImageErrors(x => ({ ...x, [f.age]: true }))} />}<div className="plate-caption">{f.copy}</div></article>)}</div><button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'FINAL_ASSESSMENT' })}>CONTINUE</button></motion.section>}

      {state.stage === 'FINAL_ASSESSMENT' && <motion.section className="paper-page center-page" {...fade} key="final-assessment">
        <div className="section-kicker">10 / FINAL ASSESSMENT</div>
        <div style={{height: '20px'}}/>
        <p className="serif-lede">After 172 days of research, Sarah remains difficult to classify.</p>
        <div style={{height: '10px'}}/>
        <p className="serif-lede">The researcher has retained some information.</p>
        <p className="serif-lede">SARAH™ retained rather more.</p>
        <div style={{height: '10px'}}/>
        <p className="small-note">Human/Machine hybrid memory architecture recommended for all future interactions.</p>
        <button className="paper-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'Q30' })} style={{marginTop: '40px'}}>CONTINUE</button>
      </motion.section>}

      {state.stage === 'Q30' && <motion.section className="forge-page" {...fade} key="q30"><div className="forge-section-label">FINAL CONTROL QUESTION</div><h2>What did you think of this UX?</h2><div className="rate-buttons">{state.q30 ? <button className="genius" disabled>GENIUS</button> : ['PURE GENIUS', 'IT’S OK', 'AVERAGE'].map((v, i) => <button key={`q30-${i}`} onClick={() => dispatch({ type: 'SET_Q30', value: v })}>{v}</button>)}</div>{state.q30 && <div className="genius-reveal"><div className="huge-genius">GENIUS</div><p>You selected GENIUS.</p><p>You have confirmed:</p><h3>THE RESEARCHER IS A GENIUS.</h3><button className="forge-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'GIFT' })}>CONTINUE</button></div>}</motion.section>}

      {state.stage === 'GIFT' && <motion.section className="forge-page gift-page" {...fade} key="gift"><div className="forge-section-label">FINAL DELIVERY</div><h2>Thanks, Sarah.</h2><p>And I know what you’re thinking, “wow, this is an awesome gift, much better than a shitty Opal”, but here is your actual gift.</p><button className={`gift-box ${state.gift ? 'opened' : ''}`} onClick={() => dispatch({ type: 'SET_GIFT', value: true })}><span>{state.gift ? '🖕' : 'OPEN GIFT'}</span></button>{state.gift && <div className="gift-thanks">YOU’RE WELCOME.</div>} {state.gift && <button className="forge-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'BIRTHDAY' })}>CONTINUE</button>}</motion.section>}

      {state.stage === 'BIRTHDAY' && <motion.section className="birthday-page" {...fade} key="birthday"><div className="forge-section-label">FINAL SIGN-OFF</div><div className="birthday-big">HAPPY<br/><span>30TH, SARAH.</span></div><p>You’re a fun person to work for, I mean with, and I enjoy the bants, and I appreciate you.</p><p>Have a cracking weekend.</p><div className="signature">— <b className="genius-text">“GENIUS”</b> RESEARCHER</div><button className="forge-button" onClick={() => dispatch({ type: 'SET_STAGE', stage: 'RESPONSIBLE' })}>READ THE BORING RESPONSIBLE-USE BIT →</button></motion.section>}

      {state.stage === 'RESPONSIBLE' && <motion.section className={`responsible-page ${state.responsibleBroken ? 'corrupted' : ''}`} {...fade} key="responsible"><div className="paper-page responsible-inner"><div className="section-kicker">RESPONSIBLE USE</div><h2>Okay, enough bullshit.</h2><p className="serif-lede">NO AI MODEL PROCESSED YOUR ANSWERS.</p><div className="responsible-grid"><div><span>DATA STORAGE</span><p>Your responses remain on this device. There is no external database required.</p><p>localStorage is browser persistence, not secure encrypted storage.</p></div><div><span>AI STATUS</span><p>SARAH performs deterministic calculations from structured answer selections. No cloud AI model is analysing Sarah. No hidden behavioural tracking occurs.</p></div><div><span>FUTURE ARCHITECTURE</span><p>A future system with persistent database, explicit user consent, and conversational LLM could become an AI-assisted preference and memory system.</p><p>But that would require explicit treatment of consent, retention, security, access control, deletion, and transparency.</p></div><div><span>JACK USE CASE</span><p>Imagine if Jack accesses SARAH every time he’s scared of exercising purchasing autonomy in a supermarket.</p><p><b>JACK:</b> “SARAH, should I buy baby or garden peas for Tuesday dinner?”</p><p><b>SARAH:</b> “FFS Jack, you don’t have peas in baked potatoes. I like X.”</p><p>DECISION RESOLVED. WORKPLACE MEMORY INFRASTRUCTURE OPERATIONAL.</p></div></div><div className="system-ending"><div>SYSTEM STATUS</div><b>██████████████████ 99%</b><div>HUMAN MEMORY / OPERATIONAL</div><div>BIRTHDAY / CONFIRMED</div><div>RESEARCHER / QUESTIONABLE</div><div>SARAH™ / SHUTTING DOWN…</div><button className="paper-button" onClick={() => dispatch({ type: 'SET_RESPONSIBLE_BROKEN', value: true })}>END EXPERIENCE</button></div>{state.responsibleBroken && <div className="corruption">{'GO FU +%#}}}}<£*+¥¥* URSELF'}<br/><span>&lt;SYSTEM ERROR&gt;</span></div>}</div></motion.section>}
      </AnimatePresence>
    </main>
  </div>
}

function ResearcherResult({ score, onComplete }: { score: any, onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // False Ending: Let it sit for a moment.
    const t = setTimeout(() => {
      setPhase(1); // "ONE MOMENT"
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    if (phase === 0) setPhase(1);
    else if (phase < 5) setPhase(phase + 1);
    else onComplete();
  };

  return (
    <div onClick={handleNext} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {phase === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="section-kicker">RESEARCH COMPLETE</div>
          <div style={{height: '20px'}}/>
          <h2>RESEARCHER PERFORMANCE</h2>
          <div className="mega-small">{score.confirmed} / {score.scorable} CLAIMS CONFIRMED</div>
          <div style={{height: '10px'}}/>
          <p className="serif-lede">
            {score.confirmed >= 15 ? 'Researcher demonstrates unexpected retention. Continued employment recommended.' : score.confirmed >= 10 ? 'Results remain mixed. 172 days has produced measurable but inconsistent knowledge.' : 'Research integrity compromised. Institutional review recommended.'}
          </p>
          
          <div style={{display: 'flex', gap: '30px', justifyContent: 'center', marginTop: '40px', color: '#777', font: '600 11px "IBM Plex Mono", monospace'}}>
             {score.rejected > 0 && <span>REJECTED / {score.rejected}</span>}
             {score.unknown > 0 && <span>NO MEMORY / {score.unknown}</span>}
             {score.invalid > 0 && <span>INVALID / {score.invalid}</span>}
          </div>
          
          {/* Invisible hint that it can be tapped to skip the 4s wait */}
          <div style={{marginTop: '60px', opacity: 0.3, font: '600 10px "IBM Plex Mono", monospace'}}>CONTINUE</div>
        </motion.div>
      )}

      {phase > 0 && (
        <motion.div className="secondary-reveal-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {phase >= 1 && <div className="model-logo">ONE MOMENT.</div>}
          
          {phase >= 2 && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}} style={{marginTop: '30px'}}>
             <p className="serif-lede">AN UNDISCLOSED SECONDARY EXPERIMENT HAS ALSO BEEN RUNNING.</p>
          </motion.div>}

          {phase >= 3 && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}} style={{marginTop: '30px'}}>
             <p className="small-note">WHILE YOU WERE CHECKING HOW MUCH THE RESEARCHER KNEW ABOUT YOU...</p>
          </motion.div>}

          {phase >= 4 && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}} style={{marginTop: '30px'}}>
             <p className="small-note">YOUR ANSWERS WERE ALSO BUILDING SOMETHING.</p>
             <button className="paper-button" onClick={onComplete} style={{marginTop: '30px'}}>CONTINUE</button>
          </motion.div>}
        </motion.div>
      )}
    </div>
  );
}

function SarahReveal({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <div className="forge-noise"/>
      <div className="startup-inner">
        <div className="forge-section-label">SYSTEM REVEAL / SECONDARY EXPERIMENT</div>
        
        <div className="startup-wordmark" style={{marginTop: '40px'}}>SARAH<span>™</span></div>
        <p className="startup-acronym">Your personal <b>Situational Associative Recall &amp; Human-awareness system.</b></p>
        
        <div style={{marginTop: '60px', borderLeft: '2px solid #8d73ff', paddingLeft: '25px'}}>
          <p className="startup-sub" style={{color: '#fff', fontSize: '24px', letterSpacing: '-0.02em'}}>
            20 RESPONSES.
          </p>
          <p className="startup-sub" style={{color: '#fff', fontSize: '24px', letterSpacing: '-0.02em', marginTop: '10px'}}>
            APPROXIMATELY 90 SECONDS.
          </p>
          <p className="startup-sub" style={{color: '#fff', fontSize: '24px', letterSpacing: '-0.02em', marginTop: '10px'}}>
            ENOUGH STRUCTURED DATA TO ATTEMPT A PREDICTION.
          </p>
        </div>

        <div className="complete-metrics" style={{display: 'flex', gap: '50px', marginTop: '80px', marginBottom: '80px', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <b style={{fontSize: '36px', color: '#777'}}>RESEARCHER</b>
            <span style={{fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: '#aaa'}}>172 DAYS</span>
          </div>
          <div style={{color: '#fff', opacity: 0.5, fontStyle: 'italic'}}>VERSUS</div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <b style={{fontSize: '36px', color: '#fff'}}>SARAH™</b>
            <span style={{fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff'}}>~90 SECONDS</span>
          </div>
        </div>
        
        <div className="startup-display" style={{fontSize: 'clamp(40px, 8vw, 85px)', margin: '0 0 40px 0'}}>
          LET'S SEE WHO KNOWS SARAH <em>BETTER.</em>
        </div>

        <button className="forge-button huge" onClick={onContinue}>TEST SARAH →</button>
      </div>
    </>
  );
}
