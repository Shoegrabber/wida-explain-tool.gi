export type SentenceFunction = 'INTRO' | 'SEQ' | 'CAUSE_EFFECT' | 'EXAMPLE_DETAIL' | 'CONCLUSION';

export type FunctionalCategory = 'participant' | 'process' | 'detail';

export interface Chunk {
    id: string;
    text: string;
    functionalCategory: FunctionalCategory;
    label: string;
}

export interface Sentence {
    id: string;
    originalText: string;
    currentText: string;
    function: SentenceFunction;
    currentFunction?: SentenceFunction;
    hotspots?: { text: string }[];
    chunks: Chunk[];
}

export interface Paragraph {
    id: string;
    sentenceIds: string[];
}

export interface MentorData {
    title: string;
    paragraphs: Paragraph[];
    sentences: Record<string, Sentence>;
    functionalLabels: Record<SentenceFunction, string>;
}

export type BankSection = 'STARTERS' | 'MY_SENTENCES' | 'MENTOR_SENTENCES' | 'TRASH';

export interface BankSentence extends Sentence {
    section: BankSection;
}

export interface Lesson {
    id: string;
    title: string;
    mentorContent: MentorData;
    defaultBank: BankSentence[];
}

export interface AppState {
    hasStarted: boolean;
    mode: 'SENTENCE' | 'PHRASE' | 'DISCOURSE';
    selectedSentenceId: string | null;
    sentences: Record<string, Sentence>;
    bank: BankSentence[];
    view: 'EDIT' | 'FINISH';
    showColors: boolean;
}
