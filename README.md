# WIDA Explain Tool (Proof of Concept)

**[Live Demo](https://Shoegrabber.github.io/wida-explain-tool.gi/)**

This is a prototype focused on supporting Grade 4 Multilingual Learners (MLLs) in developing scientific "Explain" writing skills. The tool uses a tactile, "Paragraph Canvas" approach to help students understand language functions and document structure through composition and manipulation.

## Target Audience
- **Primary**: Grade 4 Multilingual Learners.
- **Goal**: Scaffolding the transition from sentence-level frames to cohesive paragraph construction in science (e.g., Weathering and Erosion).

## What this PoC Demonstrates
- **Paragraph Canvas**: A document-first layout where sentences flow and wrap naturally, moving away from rigid form-based inputs.
- **Insertion-First Drag-and-Drop**: Composing text by dragging models from a bank and inserting them directly into the flow of a paragraph, complete with caret-style insertion indicators.
- **Reusable Sentence Library**: A centralized, resizable bank of model sentences that can be dropped into the canvas multiple times to build complex explanations.
- **Bidirectional Manipulation**: Sentences can be reordered within the canvas or dragged back to the library to refine the draft.
- **Linguistic Function Scaffolding**: Color-coded categorization of scientific language functions (Intro, Sequence, Cause/Effect, etc.) that persists through all interactions.
- **Inline Editing**: A seamless `contentEditable` experience that allows students to refine text without breaking the paragraph's visual structure.
- **Accessibility**: Built-in Text-to-Speech (TTS) with visual highlighting for sentence-level reading support.

## Intentionally WIP (Not Finished)
- **Advanced Phrase Mode**: While basic hotspot editing exists, the full phrase-level manipulation system is simplified in this version.
- **Multiple Mentor Texts**: The prototype currently centers on a single "Weathering and Erosion" example text.
- **Persistence & Cloud Storage**: This is a client-side only prototype. No user accounts, database, or cloud-saving features are implemented.
- **Teacher Dashboard**: Analytical tools and teacher feedback mechanisms are not part of this PoC.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd wida-explain-tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

## Built With
- React & Vite
- TypeScript
- Lucide React (Icons)
- Vanilla CSS
