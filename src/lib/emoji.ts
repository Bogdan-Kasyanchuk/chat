export const RECENT_EMOJI_KEY = 'chat-recent-emoji';
export const SKIN_TONE_KEY = 'chat-emoji-skin-tone';
export const MAX_RECENT_EMOJI = 18;

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const EMOJI_START = /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator})/u;

export const insertAtCursor = (value: string, start: number, end: number, insert: string, maxLength: number): { value: string, caret: number } => {
    const next = value.slice(0, start) + insert + value.slice(end);

    if (next.length > maxLength) {
        return { value, caret: end };
    }

    return { value: next, caret: start + insert.length };
};

// Кількість графем, якщо текст (без пробілів) — самі емодзі; інакше 0
export const emojiOnlyCount = (text: string): number => {
    const graphemes = Array.from(segmenter.segment(text.replace(/\s+/gu, '')), part => part.segment);

    return graphemes.length > 0 && graphemes.every(grapheme => EMOJI_START.test(grapheme)) ? graphemes.length : 0;
};

export const pushRecent = (list: string[], emoji: string): string[] => [ emoji, ...list.filter(item => item !== emoji) ].slice(0, MAX_RECENT_EMOJI);

// У приватному режимі сховище може кидати
export const readRecent = (): string[] => {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_EMOJI_KEY) ?? '[]');

        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_EMOJI) : [];
    } catch {
        return [];
    }
};

export const writeRecent = (list: string[]): void => {
    try {
        localStorage.setItem(RECENT_EMOJI_KEY, JSON.stringify(list));
    } catch {
        // Без сховища «Recently used» просто не переживе перезавантаження
    }
};

export const readSkinTone = (): string => {
    try {
        return localStorage.getItem(SKIN_TONE_KEY) ?? 'none';
    } catch {
        return 'none';
    }
};

export const writeSkinTone = (tone: string): void => {
    try {
        localStorage.setItem(SKIN_TONE_KEY, tone);
    } catch {
        // Див. writeRecent
    }
};
