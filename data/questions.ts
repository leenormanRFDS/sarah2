export type QuestionKind = 'MEMORY_ANCHOR' | 'HYBRID' | 'BEHAVIOURAL_SIGNAL' | 'JOKE_EXCEPTION';
export type PredictionState = 'KNOWN' | 'SPLIT' | 'UNKNOWN' | 'INVALID';
export type Vec5 = [number, number, number, number, number]; // [S, N, A, SE, P]

export interface QuestionOption {
  id: string;
  label: string;
  vector?: Vec5;
}

export interface ResearcherPrediction {
  state: PredictionState;
  optionIds: string[];
  display: string;
}

export interface Question {
  id: number;
  kind: QuestionKind;
  question: string;
  options: QuestionOption[];
  researcherPrediction: ResearcherPrediction;
  visibleReaction: string;
  profileWeight: number;
  narrativeReason?: string;
}

export const questions: Question[] = [
  {
    id: 1,
    kind: 'MEMORY_ANCHOR',
    question: 'Favorite color?',
    options: [
      { id: 'A', label: 'Magenta' },
      { id: 'B', label: 'Blue' },
      { id: 'C', label: 'Green' },
      { id: 'D', label: 'Purple' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Magenta.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 2,
    kind: 'MEMORY_ANCHOR',
    question: 'Favorite food?',
    options: [
      { id: 'A', label: 'Potatoes' },
      { id: 'B', label: 'Pasta' },
      { id: 'C', label: 'Pizza' },
      { id: 'D', label: 'Chocolate' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Anything potato — except salt & vinegar chips.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 3,
    kind: 'MEMORY_ANCHOR',
    question: 'Favorite movie genre?',
    options: [
      { id: 'A', label: 'Fantasy' },
      { id: 'B', label: 'Comedy' },
      { id: 'C', label: 'Thriller' },
      { id: 'D', label: 'Drama' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Fantasy — Lord of the Rings shit.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 4,
    kind: 'HYBRID',
    question: 'Morning person or night person?',
    options: [
      { id: 'A', label: 'Morning', vector: [1, -1, 0, -1, 1] },
      { id: 'B', label: 'Night', vector: [-1, 1, 0, 1, -1] },
      { id: 'C', label: 'Depends', vector: [0, 0, 0, 0, 0] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Morning — she leaves early every day.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.5
  },
  {
    id: 5,
    kind: 'MEMORY_ANCHOR',
    question: 'Shower or bath?',
    options: [
      { id: 'A', label: 'Shower' },
      { id: 'B', label: 'Bath' },
      { id: 'C', label: 'Either' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Shower — who has time for a bath?' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 6,
    kind: 'MEMORY_ANCHOR',
    question: 'How many times has Sarah left Australia?',
    options: [
      { id: 'A', label: '0' },
      { id: 'B', label: '1' },
      { id: 'C', label: '2' },
      { id: 'D', label: '3+' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'Twice.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 7,
    kind: 'MEMORY_ANCHOR',
    question: 'Cat or dog?',
    options: [
      { id: 'A', label: 'Cat' },
      { id: 'B', label: 'Dog' },
      { id: 'C', label: 'Neither' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['B'], display: 'Dog.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 8,
    kind: 'HYBRID',
    question: 'Dishwasher loading?',
    options: [
      { id: 'A', label: 'Everything has a designated place.', vector: [2, -1, -1, -1, 2] },
      { id: 'B', label: 'Cram it all in — it’ll fit.', vector: [-2, 1, 1, 1, -2] },
      { id: 'C', label: 'Dishwasher? That’s Jack’s department.', vector: [0, 0, 2, 0, 1] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'Dishwasher? That’s Jack’s department.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.75
  },
  {
    id: 9,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'Friends can\'t decide where to eat. What does Sarah do?',
    options: [
      { id: 'A', label: 'Picks a place and tells everyone', vector: [0, 0, 2, 1, 1] },
      { id: 'B', label: 'Offers two options to vote on', vector: [1, 0, 1, 1, 2] },
      { id: 'C', label: 'Waits for someone else to decide', vector: [0, 0, -2, -1, -1] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['B'], display: 'Offers two options — democratic but decisive.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 1.0
  },
  {
    id: 10,
    kind: 'MEMORY_ANCHOR',
    question: 'Reality TV?',
    options: [
      { id: 'A', label: 'Yes' },
      { id: 'B', label: 'No' },
      { id: 'C', label: 'Selectively' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'Selectively — Love on the Spectrum.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 11,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'Packing for a weekend trip?',
    options: [
      { id: 'A', label: 'Spreadsheet and packed two days prior', vector: [2, -2, 1, 0, 2] },
      { id: 'B', label: 'Thrown together the night before', vector: [0, 1, 0, 0, 0] },
      { id: 'C', label: 'Packed 10 minutes before leaving', vector: [-2, 2, -1, 0, -2] }
    ],
    researcherPrediction: { state: 'SPLIT', optionIds: ['A', 'B'], display: 'Somewhere between the spreadsheet and the night before.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 1.0
  },
  {
    id: 12,
    kind: 'MEMORY_ANCHOR',
    question: 'If Sarah could choose an unusual pet, what would she pick?',
    options: [
      { id: 'A', label: 'Snake' },
      { id: 'B', label: 'Miniature pig' },
      { id: 'C', label: 'Axolotl' },
      { id: 'D', label: 'Horse' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'Something people can’t spell, like axolotl.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 13,
    kind: 'HYBRID',
    question: 'Would Sarah ever buy a horse?',
    options: [
      { id: 'A', label: 'Yes', vector: [-1, 1, 2, 1, -2] },
      { id: 'B', label: 'No', vector: [2, -1, 0, -1, 2] },
      { id: 'C', label: 'Only if someone else handled the cost and work', vector: [1, 0, 2, 0, 2] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'Not herself — she’d get Jack to buy it.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.75
  },
  {
    id: 14,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'A new flat-pack bookshelf arrives. How is it getting built?',
    options: [
      { id: 'A', label: 'Reads the manual cover to cover', vector: [2, -1, 1, 0, 2] },
      { id: 'B', label: 'Skims the manual and wings it', vector: [-1, 1, 1, 0, -1] },
      { id: 'C', label: 'Leaves it for Jack', vector: [0, 0, -1, 0, 1] }
    ],
    researcherPrediction: { state: 'UNKNOWN', optionIds: [], display: 'NO RELIABLE MEMORY FOUND.' },
    visibleReaction: 'NEW INFORMATION ACQUIRED.',
    profileWeight: 1.0
  },
  {
    id: 15,
    kind: 'MEMORY_ANCHOR',
    question: 'Favorite board game?',
    options: [
      { id: 'A', label: 'Monopoly' },
      { id: 'B', label: 'Catan' },
      { id: 'C', label: 'Uno' }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['A'], display: 'Monopoly — so she can charge Jack full rent.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.0
  },
  {
    id: 16,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'The barista makes the coffee wrong. What happens?',
    options: [
      { id: 'A', label: 'Politely asks them to remake it', vector: [0, 0, 2, 0, 0] },
      { id: 'B', label: 'Drinks it anyway to avoid a fuss', vector: [0, 0, -2, -1, 1] },
      { id: 'C', label: 'Depends on how bad it is', vector: [0, 0, 0, 0, 0] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['B'], display: 'Drinks it anyway to avoid a fuss.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 1.0
  },
  {
    id: 17,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'Ideal Friday night?',
    options: [
      { id: 'A', label: 'Big night out', vector: [-1, 2, 0, 2, -1] },
      { id: 'B', label: 'Dinner somewhere nice', vector: [1, 0, 0, 1, 1] },
      { id: 'C', label: 'Staying home', vector: [1, -1, 0, -2, 2] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['B'], display: 'Dinner somewhere nice.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 1.0
  },
  {
    id: 18,
    kind: 'HYBRID',
    question: 'If Sarah won $10m, what would she buy first?',
    options: [
      { id: 'A', label: 'House', vector: [1, -1, 0, 0, 2] },
      { id: 'B', label: 'Travel', vector: [0, 2, 1, 1, -1] },
      { id: 'C', label: 'Something ridiculous', vector: [-2, 2, 2, 0, -2] },
      { id: 'D', label: 'Investment', vector: [2, -2, -1, 0, 2] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['C'], display: 'A diamond mine in Sierra Leone.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 0.5
  },
  {
    id: 19,
    kind: 'BEHAVIOURAL_SIGNAL',
    question: 'What does Sarah\'s personal email inbox look like?',
    options: [
      { id: 'A', label: 'Inbox Zero', vector: [2, 0, 1, 0, 1] },
      { id: 'B', label: 'A few unread but managed', vector: [1, 0, 0, 0, 2] },
      { id: 'C', label: 'Thousands of unread promotional emails', vector: [-2, 0, -1, 0, -1] }
    ],
    researcherPrediction: { state: 'KNOWN', optionIds: ['B'], display: 'A few unread but managed.' },
    visibleReaction: 'Confirmed.',
    profileWeight: 1.0
  },
  {
    id: 20,
    kind: 'JOKE_EXCEPTION',
    question: 'If you could choose your own name as a boy, which would you pick?',
    options: [
      { id: 'A', label: 'William' },
      { id: 'B', label: 'Max' },
      { id: 'C', label: 'Miles' },
      { id: 'D', label: 'James' }
    ],
    researcherPrediction: { state: 'INVALID', optionIds: [], display: 'INVALID CLAIM — OPTION DOES NOT EXIST.' },
    visibleReaction: 'RESEARCHER HAS ELECTED TO RETAIN CLAIM.',
    profileWeight: 0.0
  }
];
