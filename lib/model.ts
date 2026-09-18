import { questions, Vec5 } from '../data/questions';

const zero: Vec5 = [0, 0, 0, 0, 0];

const add = (a: Vec5, b: Vec5): Vec5 => a.map((v, i) => v + b[i]) as Vec5;
const scale = (a: Vec5, s: number): Vec5 => a.map(v => v * s) as Vec5;

const norm = (a: Vec5): Vec5 => {
  const m = Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
  return m > 0 ? scale(a, 1 / m) : zero;
};

export const cosine = (a: Vec5, b: Vec5): number => {
  const na = Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
  const nb = Math.sqrt(b.reduce((acc, v) => acc + v * v, 0));
  if (na === 0 || nb === 0) return 0;
  return a.reduce((acc, v, i) => acc + v * b[i], 0) / (na * nb);
};

export function buildModelVector(responses: Record<number, string>): Vec5 {
  let rawProfile: Vec5 = zero;

  for (const [qidStr, optionId] of Object.entries(responses)) {
    const qid = Number(qidStr);
    const q = questions.find(q => q.id === qid);
    if (!q || q.profileWeight === 0) continue;

    const opt = q.options.find(o => o.id === optionId);
    if (!opt || !opt.vector) continue;

    rawProfile = add(rawProfile, scale(opt.vector, q.profileWeight));
  }

  return norm(rawProfile);
}

export type TestQuestion = {
  id: string;
  question: string;
  options: { id: string; label: string; vector: Vec5 }[];
  note: string;
};

export const testQuestions: TestQuestion[] = [
  {
    id: 'TEST-01',
    question: 'A friend cancels plans at the last minute. What does Sarah most likely do?',
    note: 'Tests flexibility versus autonomy.',
    options: [
      { id: 'A', label: 'Immediately make a new plan', vector: [1, 1, 1, 1, 0] },
      { id: 'B', label: 'Quietly enjoy having the night back', vector: [1, -1, 0, -1, 2] },
      { id: 'C', label: 'Ask what happened, then decide', vector: [0, 0, 1, 0, 1] },
      { id: 'D', label: 'Be annoyed but go with it', vector: [0, -1, 0, 0, 1] },
    ]
  },
  {
    id: 'TEST-02',
    question: "Sarah receives $1,000 she wasn't expecting. What is she most likely to do?",
    note: 'Tests value orientation and planning.',
    options: [
      { id: 'A', label: 'Save it', vector: [2, -1, 0, -1, 2] },
      { id: 'B', label: 'Buy something she has wanted for ages', vector: [0, 1, 1, 0, 1] },
      { id: 'C', label: 'Spend it on an experience', vector: [-1, 2, 1, 1, -1] },
      { id: 'D', label: 'Split it between saving and spending', vector: [1, 0, 0, 0, 2] },
    ]
  },
  {
    id: 'TEST-03',
    question: 'Sarah suddenly has a completely free Saturday with nothing booked. What happens?',
    note: 'Tests planning, novelty, autonomy, and social pull.',
    options: [
      { id: 'A', label: 'She makes a plan', vector: [2, -1, 1, 0, 2] },
      { id: 'B', label: 'She finds something spontaneous to do', vector: [-1, 2, 1, 2, -1] },
      { id: 'C', label: 'She stays home and enjoys the lack of obligation', vector: [1, -1, 0, -1, 2] },
      { id: 'D', label: 'She waits to see what everyone else is doing', vector: [-1, 1, -1, 1, 0] },
    ]
  },
];

export function predict(test: TestQuestion, model: Vec5): string {
  const scored = test.options.map(o => ({ id: o.id, score: cosine(model, o.vector) }));
  // Sort descending by score, tie-break by lowest index (localeCompare ascending is fine for A,B,C,D)
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored[0].id;
}

export function modelSummary(model: Vec5) {
  return {
    structure: model[0],
    novelty: model[1],
    agency: model[2],
    socialEnergy: model[3],
    practicality: model[4],
  };
}

export function calculateResearcherScore(responses: Record<number, string>) {
  let confirmed = 0;
  let rejected = 0;
  let unknown = 0;
  let invalid = 0;
  let scorable = 0;

  for (const [qidStr, optionId] of Object.entries(responses)) {
    const qid = Number(qidStr);
    const q = questions.find(q => q.id === qid);
    if (!q) continue;

    const state = q.researcherPrediction.state;
    if (state === 'UNKNOWN') {
      unknown++;
    } else if (state === 'INVALID') {
      invalid++;
    } else if (state === 'KNOWN' || state === 'SPLIT') {
      scorable++;
      if (q.researcherPrediction.optionIds.includes(optionId)) {
        confirmed++;
      } else {
        rejected++;
      }
    }
  }

  return {
    totalAnswers: Object.keys(responses).length,
    scorable,
    confirmed,
    rejected,
    unknown,
    invalid,
  };
}
