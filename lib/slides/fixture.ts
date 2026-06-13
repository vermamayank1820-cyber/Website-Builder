import type { SlideDeck } from './types'

/** A realistic deck used for visual review and as a safe demo seed. */
export const FIXTURE_DECK: SlideDeck = {
  title: 'Northwind — Series A',
  subtitle: 'Release intelligence for engineering teams',
  theme: 'editorial',
  slides: [
    { id: 's1', layout: 'title', eyebrow: 'Series A · 2026', title: 'Ship with the lights on', subtitle: 'Northwind turns every deploy into a calm, legible story — what shipped, what changed, what’s at risk.', bullets: [], columns: [], quote: {}, stats: [], body: '', notes: 'Open with the vision in one line.' },
    { id: 's2', layout: 'section', eyebrow: '01', title: 'The problem', subtitle: 'Teams ship faster than they can understand what they shipped.', bullets: [], columns: [], quote: {}, stats: [], body: '', notes: 'Set up the pain.' },
    { id: 's3', layout: 'bullets', eyebrow: 'The problem', title: 'Deploys are a black box', body: 'Once code merges, visibility disappears — exactly when it matters most.', bullets: ['No clear view of a deploy’s blast radius', 'Incidents found by users, not teams', 'Rollbacks are frantic, manual, and late', 'Post-mortems start from zero'], columns: [], quote: {}, stats: [], subtitle: '', notes: 'Four sharp pains.' },
    { id: 's4', layout: 'section', eyebrow: '02', title: 'The solution', subtitle: 'A calm layer between your pipeline and your team.', bullets: [], columns: [], quote: {}, stats: [], body: '', notes: 'Transition to product.' },
    { id: 's5', layout: 'two-column', eyebrow: 'How it works', title: 'See, narrate, recover', subtitle: '', body: '', bullets: [], columns: [{ heading: 'Blast radius', body: 'Read the dependency graph and score the real risk of every release.' }, { heading: 'Change narrative', body: 'Eighteen commits become one legible story, grouped by service and author.' }, { heading: 'One-click rollback', body: 'Pre-armed recovery that drains traffic and restores in seconds.' }], quote: {}, stats: [], notes: 'Three pillars.' },
    { id: 's6', layout: 'stat', eyebrow: '', title: 'Early results from design partners', subtitle: '', body: '', bullets: [], columns: [], quote: {}, stats: [{ value: '73%', label: 'fewer surprise rollbacks in 90 days' }, { value: '12s', label: 'median time from signal to safe' }, { value: '2.4M', label: 'deploys observed' }], notes: 'Lead with proof.' },
    { id: 's7', layout: 'quote', eyebrow: '', title: '', subtitle: '', body: '', bullets: [], columns: [], quote: { text: 'The first tool that made deploys feel boring — in the best possible way.', author: 'Head of Platform, design partner' }, stats: [], notes: 'Social proof beat.' },
    { id: 's8', layout: 'bullets', eyebrow: 'Market', title: 'A wedge into every engineering org', body: '', bullets: ['28k companies run continuous deployment today', 'Bottoms-up adoption by platform teams', 'Expands from observability into action', 'Land with one team, expand org-wide'], columns: [], quote: {}, subtitle: '', stats: [], notes: 'Market + GTM.' },
    { id: 's9', layout: 'stat', eyebrow: '', title: 'Traction', subtitle: '', body: '', bullets: [], columns: [], quote: {}, stats: [{ value: '14', label: 'design partners' }, { value: '$240k', label: 'ARR in pipeline' }, { value: '4.9', label: 'avg rating from platform engineers' }], notes: 'Momentum.' },
    { id: 's10', layout: 'two-column', eyebrow: 'The ask', title: 'Raising $6M Series A', subtitle: '', body: '', bullets: [], columns: [{ heading: 'Use of funds', body: 'Engineering depth, design-partner → GA, and a focused go-to-market motion.' }, { heading: '18-month goal', body: '$3M ARR, 120 customers, and the category-defining release layer.' }], quote: {}, stats: [], notes: 'Make the ask concrete.' },
    { id: 's11', layout: 'closing', eyebrow: 'Northwind', title: 'Ship like the lights are on', subtitle: 'hello@northwind.dev', bullets: [], columns: [], quote: {}, stats: [], body: '', notes: 'Close with the vision + contact.' },
  ],
}
