/**
 * AI Insights Engine (Zero-Budget Edition)
 * Uses deterministic algorithms for:
 * - Extractive summarization (TF-IDF)
 * - Question generation
 * - Action item detection
 * - Key point extraction
 */

// Question starter patterns
const QUESTION_STARTERS = [
    'what', 'why', 'how', 'when', 'where', 'who', 'which', 'could', 'should', 'would',
    'can we', 'do we', 'is there', 'are there', 'will we'
];

// Action indicators
const ACTION_INDICATORS = [
    'need to', 'should', 'must', 'have to', 'will', 'going to',
    'action item', 'todo', 'task', 'follow up', 'next step'
];

// Decision indicators
const DECISION_KEYWORDS = [
    'decided', 'agreed', 'approved', 'resolved', 'confirmed',
    'we will', 'let\'s', 'final decision'
];

/**
 * Extract sentences from text
 */
const extractSentences = (text) => {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
};

/**
 * Calculate TF-IDF scores for sentences
 */
const calculateTfIdf = (sentences) => {
    // Term frequency in each sentence
    const sentenceWords = sentences.map(s =>
        s.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );

    // Document frequency (how many sentences contain the word)
    const docFreq = {};
    sentenceWords.forEach(words => {
        const uniqueWords = [...new Set(words)];
        uniqueWords.forEach(word => {
            docFreq[word] = (docFreq[word] || 0) + 1;
        });
    });

    // Calculate TF-IDF for each sentence
    const scores = sentences.map((sentence, i) => {
        const words = sentenceWords[i];
        const wordCount = words.length;

        const score = words.reduce((sum, word) => {
            const tf = 1 / wordCount; // Normalized term frequency
            const idf = Math.log(sentences.length / (docFreq[word] || 1));
            return sum + (tf * idf);
        }, 0);

        return { sentence, score, index: i };
    });

    return scores.sort((a, b) => b.score - a.score);
};

/**
 * Generate extractive summary
 */
export const generateSummary = (text, maxSentences = 3) => {
    if (!text || text.length < 50) return text;

    const sentences = extractSentences(text);
    if (sentences.length <= maxSentences) return text;

    const rankedSentences = calculateTfIdf(sentences);

    // Take top N sentences and re-order by original position
    const topSentences = rankedSentences
        .slice(0, maxSentences)
        .sort((a, b) => a.index - b.index)
        .map(s => s.sentence);

    return topSentences.join('. ') + '.';
};

/**
 * Extract questions from text
 */
export const extractQuestions = (text) => {
    const sentences = extractSentences(text);

    return sentences.filter(sentence => {
        const lower = sentence.toLowerCase();
        return QUESTION_STARTERS.some(starter =>
            lower.startsWith(starter) || lower.includes(` ${starter} `)
        ) || sentence.trim().endsWith('?');
    });
};

/**
 * Extract action items
 */
export const extractActionItems = (text) => {
    const sentences = extractSentences(text);

    return sentences.filter(sentence => {
        const lower = sentence.toLowerCase();
        return ACTION_INDICATORS.some(indicator => lower.includes(indicator));
    });
};

/**
 * Extract decisions made
 */
export const extractDecisions = (text) => {
    const sentences = extractSentences(text);

    return sentences.filter(sentence => {
        const lower = sentence.toLowerCase();
        return DECISION_KEYWORDS.some(keyword => lower.includes(keyword));
    });
};

/**
 * Extract key topics (simple frequency-based)
 */
export const extractKeyTopics = (text, maxTopics = 5) => {
    const words = text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4) // Skip short words
        .filter(w => !/^(this|that|what|when|where|with|have|been|from|would|could|should)$/.test(w));

    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxTopics)
        .map(([word]) => word);
};

/**
 * Generate AI insights from note content
 * Returns structured insights object
 */
export const analyzeNoteInsights = (content) => {
    if (!content || content.length < 20) return null;

    const summary = generateSummary(content, 3);
    const questions = extractQuestions(content);
    const actionItems = extractActionItems(content);
    const decisions = extractDecisions(content);
    const topics = extractKeyTopics(content, 5);

    // Only return insights if we found something meaningful
    const hasInsights = questions.length > 0 || actionItems.length > 0 ||
        decisions.length > 0 || topics.length > 2;

    if (!hasInsights) return null;

    return {
        summary,
        questions,
        actionItems,
        decisions,
        topics,
        generatedAt: new Date().toISOString()
    };
};

/**
 * Suggest questions based on content (proactive mode)
 */
export const suggestQuestions = (content) => {
    const sentences = extractSentences(content);
    const topics = extractKeyTopics(content, 3);

    const suggestions = [];

    // If discussing numbers/metrics
    if (/\d+%|\$\d+|increase|decrease|growth/i.test(content)) {
        suggestions.push("What are the key metrics we should track?");
    }

    // If discussing timeline
    if (/deadline|due|by|timeline|schedule/i.test(content)) {
        suggestions.push("When is the target completion date?");
    }

    // If discussing problems
    if (/issue|problem|challenge|blocker/i.test(content)) {
        suggestions.push("What's blocking progress?");
        suggestions.push("How can we mitigate this risk?");
    }

    // If discussing people/teams
    if (/team|developer|designer|manager/i.test(content)) {
        suggestions.push("Who is responsible for this?");
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
};
