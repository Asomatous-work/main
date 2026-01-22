import * as chrono from 'chrono-node';

/**
 * Enhanced NLP Engine for Smart Notes
 * Detects: Reminders, Tasks, Deadlines, Events
 */

// Intent keyword mapping
const INTENT_PATTERNS = {
  reminder: ['remind', 'remember', 'don\'t forget', 'alert', 'notify'],
  call: ['call', 'phone', 'ring', 'dial'],
  meeting: ['meet', 'meeting', 'zoom', 'sync', 'standup', 'catch up'],
  task: ['todo', 'task', 'finish', 'complete', 'do', 'need to'],
  deadline: ['deadline', 'due', 'submit', 'deliver', 'by'],
  event: ['appointment', 'event', 'schedule', 'book'],
  cancel: ['cancel', 'unsubscribe', 'stop']
};

/**
 * Analyzes a single line or sentence for actionable intent.
 * @param {string} text - The input text
 * @returns {object|null} - Detected action or null
 */
export const analyzeText = (text) => {
  if (!text || text.length < 5) return null;

  const results = chrono.parse(text, new Date(), { forwardDate: true });
  if (results.length === 0) return null;

  const result = results[0];
  const date = result.start.date();

  // Filter past dates
  if (date < new Date()) return null;

  const lowerText = text.toLowerCase();

  // Determine action type
  let actionType = 'reminder'; // default
  let confidence = 'medium';

  for (const [type, keywords] of Object.entries(INTENT_PATTERNS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      actionType = type;
      confidence = 'high';
      break;
    }
  }

  // Require time for higher confidence
  const hasTime = result.start.isCertain('hour');
  if (!hasTime && confidence === 'medium') return null;

  // Extract title
  let title = text.replace(result.text, '').trim();
  title = title.replace(/^[\.,\-:;•\-]+/, '').replace(/[\.,\-:;]+$/, '').trim();

  if (!title) {
    title = actionType === 'call' ? 'Call' :
      actionType === 'meeting' ? 'Meeting' : 'Reminder';
  }

  return {
    type: actionType,
    title,
    date,
    originalText: result.text,
    fullLine: text,
    confidence
  };
};

/**
 * Analyzes entire note content (multi-line) for all actionable items.
 * @param {string} content - Full note content
 * @returns {Array} - Array of detected actions
 */
export const analyzeNoteContent = (content) => {
  if (!content) return [];

  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const actions = [];

  for (const line of lines) {
    const action = analyzeText(line);
    if (action) {
      actions.push({
        ...action,
        lineText: line
      });
    }
  }

  return actions;
};
