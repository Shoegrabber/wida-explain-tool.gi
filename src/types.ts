export type SentenceFunction = 'INTRO' | 'SEQ' | 'CAUSE_EFFECT' | 'EXAMPLE_DETAIL' | 'CONCLUSION';

export interface PhraseHotspot {
    text: string;
}

export interface Sentence {
    id: string;
    originalText: string;
    currentText: string;
    function: SentenceFunction;
    hotspots?: PhraseHotspot[];
}

export interface Paragraph {
    id: string;
    sentenceIds: string[];
}

export interface MentorData {
    title: string;
    paragraphs: Paragraph[];
    sentences: Record<string, Sentence>;
}

export type BankSection = 'STARTERS' | 'MY_SENTENCES' | 'MENTOR_SENTENCES' | 'TRASH';

export interface BankSentence extends Sentence {
    section: BankSection;
}

export interface AppState {
    hasStarted: boolean; // For landing or reset state
    mode: 'SENTENCE' | 'PHRASE' | 'DISCOURSE';
    selectedSentenceId: string | null;
    sentences: Record<string, Sentence>;
    bank: BankSentence[];
    view: 'EDIT' | 'FINISH';
    showColors: boolean;
}
