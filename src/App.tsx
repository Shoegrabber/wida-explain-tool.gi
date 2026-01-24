import React, { useState, useEffect } from 'react';
import type { Sentence, SentenceFunction, BankSentence, BankSection, Lesson } from './types';
import { Plus, Play, BookOpen, Check, Download, Clipboard, RefreshCw, X, Layers } from 'lucide-react';
import LandingPage from './LandingPage';
import './index.css';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  rectIntersection,
  closestCenter,
  type CollisionDetection,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableSentence } from './DraggableSentence';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

const App: React.FC = () => {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sentences, setSentences] = useState<Record<string, Sentence>>({});
  const [bank, setBank] = useState<BankSentence[]>([]);
  const [paragraphs, setParagraphs] = useState<any[]>([]);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [mode, setMode] = useState<'SENTENCE' | 'PHRASE' | 'DISCOURSE'>('SENTENCE');
  const [view, setView] = useState<'EDIT' | 'FINISH'>('EDIT');
  const [showColors, setShowColors] = useState(true);
  const [readingSentenceId, setReadingSentenceId] = useState<string | null>(null);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [preEditBankText, setPreEditBankText] = useState<string>("");
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [preEditMentorText, setPreEditMentorText] = useState<string>("");

  const [isBankOpen, setIsBankOpen] = useState(true);
  const [isCreatorMenuOpen, setIsCreatorMenuOpen] = useState(false);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson');

    if (lessonId) {
      // Dynamic import to support both weathering and plastic pollution (or future lessons)
      const lessonPath = lessonId === 'weathering'
        ? './data/lessons/g4-explain-weathering.json'
        : `./data/lessons/${lessonId}.json`;

      import(/* @vite-ignore */ lessonPath).then((data) => {
        const lesson = data.default as Lesson;

        // Basic Validation
        if (!lesson || !lesson.mentorContent || !lesson.defaultBank) {
          throw new Error("Lesson data is incomplete or malformed.");
        }

        setCurrentLesson(lesson);
        setSentences({ ...lesson.mentorContent.sentences });
        setBank([...lesson.defaultBank]);
        setParagraphs(lesson.mentorContent.paragraphs.map(p => ({ ...p })));
        setLoading(false);
      }).catch(err => {
        console.error(`Failed to load lesson "${lessonId}":`, err);
        setLoadError(`The lesson "${lessonId}" could not be loaded. It may be missing or contains errors.`);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSelectLesson = (id: string) => {
    window.location.search = `?lesson=${id}`;
  };

  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setReadingSentenceId(null);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  };

  const readSentence = () => {
    if (!selectedSentenceId) return;
    const s = sentences[selectedSentenceId];
    setReadingSentenceId(selectedSentenceId);
    speak(s.currentText);
  };

  const readFullText = () => {
    if (!currentLesson) return;
    const fullText = paragraphs.map(p =>
      p.sentenceIds.map((id: string) => sentences[id].currentText).join(' ')
    ).join('\n\n');
    speak(fullText);
  };

  const createTemplatedSentence = (category: SentenceFunction) => {
    const templates: Record<SentenceFunction, string> = {
      INTRO: "To start with, ____.",
      SEQ: "Then, ____.",
      CAUSE_EFFECT: "Because of this, ____ happens.",
      EXAMPLE_DETAIL: "For example, ____.",
      CONCLUSION: "In conclusion, ____."
    };

    const newSentence: BankSentence = {
      id: `bank-${Date.now()}`,
      originalText: templates[category],
      currentText: templates[category],
      function: category,
      section: "MY_SENTENCES",
      chunks: []
    };

    setBank(prev => [...prev, newSentence]);
    setEditingBankId(newSentence.id);
    setIsCreatorMenuOpen(false);
  };

  const addBankSentence = () => setIsCreatorMenuOpen(!isCreatorMenuOpen);
  const moveToTrash = (id: string) => setBank(prev => prev.map(s => s.id === id ? { ...s, section: 'TRASH' } : s));
  const deletePermanently = (id: string) => setBank(prev => prev.filter(s => s.id !== id));
  const updateBankSentence = (id: string, text: string) => setBank(prev => prev.map(s => s.id === id ? { ...s, currentText: text } : s));

  const updateMentorSentence = (id: string, text: string) => {
    setSentences(prev => ({
      ...prev,
      [id]: { ...prev[id], currentText: text }
    }));
  };

  const updateChunkText = (sentenceId: string, chunkId: string, text: string) => {
    setSentences(prev => {
      const s = prev[sentenceId];
      if (!s || !s.chunks) return prev;
      const formattedText = text.trim() ? ` ${text.trim()} ` : " ";
      const newChunks = s.chunks.map(c => c.id === chunkId ? { ...c, text: formattedText } : c);
      const newCurrentText = newChunks.map(c => c.text).join("");
      return { ...prev, [sentenceId]: { ...s, chunks: newChunks, currentText: newCurrentText } };
    });
  };

  const downloadTxt = () => {
    if (!currentLesson) return;
    const text = `${currentLesson.mentorContent.title}\n\n` + paragraphs.map(p =>
      p.sentenceIds.map((id: string) => sentences[id].currentText).join(' ')
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WIDA-Explain-Draft.txt';
    a.click();
  };

  const copyToClipboard = () => {
    if (!currentLesson) return;
    const text = `${currentLesson.mentorContent.title}\n\n` + paragraphs.map(p =>
      p.sentenceIds.map((id: string) => sentences[id].currentText).join(' ')
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const startFresh = () => {
    if (!currentLesson) return;
    setSentences({ ...currentLesson.mentorContent.sentences });
    setBank([...currentLesson.defaultBank]);
    setSelectedSentenceId(null);
    setReadingSentenceId(null);
    setView('EDIT');
  };

  const getFunctionClass = (func: SentenceFunction) => {
    switch (func) {
      case 'INTRO': return 'function-intro';
      case 'SEQ': return 'function-seq';
      case 'CAUSE_EFFECT': return 'function-cause_effect';
      case 'EXAMPLE_DETAIL': return 'function-example_detail';
      case 'CONCLUSION': return 'function-conclusion';
      default: return 'function-none';
    }
  };

  const hybridCollision: CollisionDetection = (args) => {
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCenter(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = active.data.current?.sortable?.containerId || 'bank-droppable';
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (activeId === overId) return;

    // REORDERING within the same paragraph - use arrayMove only
    if (activeContainer === overContainer && activeContainer.startsWith('p-')) {
      const pId = activeContainer.replace('p-', '');
      setParagraphs(prev => prev.map(p => {
        if (p.id === pId) {
          const oldIdx = p.sentenceIds.indexOf(activeId);
          const newIdx = p.sentenceIds.indexOf(overId);
          if (oldIdx !== -1 && newIdx !== -1) {
            return { ...p, sentenceIds: arrayMove(p.sentenceIds, oldIdx, newIdx) };
          }
        }
        return p;
      }));
      return; // Early return to prevent further processing
    }

    // MOVING between different containers (bank to paragraph, or paragraph to paragraph)
    if (activeContainer !== overContainer) {
      if (overContainer.startsWith('p-')) {
        const destPId = overContainer.replace('p-', '');
        setParagraphs(prev => {
          const activeInAnyP = prev.find(p => p.sentenceIds.includes(activeId));

          if (!activeInAnyP && activeContainer === 'bank-droppable') {
            // Dragging from bank to a paragraph for the first time
            return prev.map(p => {
              if (p.id === destPId) {
                const overIdx = p.sentenceIds.indexOf(overId);
                const newIds = [...p.sentenceIds.filter((id: string) => id !== activeId)];
                const newIdx = overIdx === -1 ? newIds.length : overIdx;
                newIds.splice(newIdx, 0, activeId);
                return { ...p, sentenceIds: newIds };
              }
              return p;
            });
          }

          if (!activeInAnyP) return prev;

          // Moving from one paragraph to another
          return prev.map(p => {
            if (p.id === destPId) {
              const overIdx = p.sentenceIds.indexOf(overId);
              const newIds = [...p.sentenceIds.filter((id: string) => id !== activeId)];
              const newIdx = overIdx === -1 ? newIds.length : overIdx;
              newIds.splice(newIdx, 0, activeId);
              return { ...p, sentenceIds: newIds };
            }
            return { ...p, sentenceIds: p.sentenceIds.filter((id: string) => id !== activeId) };
          });
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = active.data.current?.sortable?.containerId || 'bank-droppable';
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    // Handle Bank to Workspace (Final)
    if (activeContainer === 'bank-droppable' && overContainer.startsWith('p-')) {
      const pId = overContainer.replace('p-', '');
      const bankItem = bank.find(b => b.id === activeId);
      if (!bankItem) return;

      const newId = `custom-${Date.now()}`;
      setSentences(prev => ({ ...prev, [newId]: { ...bankItem, id: newId } }));
      setParagraphs(prev => prev.map(p => {
        if (p.id === pId) {
          // Replace the bankId with the newId in the paragraph's sentenceIds
          // onDragOver might have already inserted activeId (the bank item id)
          const newIds = p.sentenceIds.map((id: string) => id === activeId ? newId : id);
          if (!newIds.includes(newId)) {
            const idx = p.sentenceIds.indexOf(overId);
            idx === -1 ? newIds.push(newId) : newIds.splice(idx, 0, newId);
          }
          return { ...p, sentenceIds: newIds };
        }
        // Also remove the bankId from other paragraphs if it was inserted there by onDragOver
        return { ...p, sentenceIds: p.sentenceIds.filter((id: string) => id !== activeId) };
      }));
    } else if (activeContainer.startsWith('p-') && overContainer === 'bank-droppable') {
      const sentence = sentences[activeId];
      if (!sentence) return;
      setBank(prev => [...prev, { ...sentence, id: `bank-${Date.now()}`, section: 'MENTOR_SENTENCES' }]);
      setParagraphs(prev => prev.map(p => ({ ...p, sentenceIds: p.sentenceIds.filter((id: string) => id !== activeId) })));
    } else if (activeContainer === overContainer && activeContainer === 'bank-droppable') {
      setBank(prev => arrayMove(prev, prev.findIndex(i => i.id === activeId), prev.findIndex(i => i.id === overId)));
    }
    // Sorting within/between paragraphs is now partially handled in onDragOver
    // But we might need a final state sync or adjustment here if needed.
  };

  const handleRemoveSentence = (id: string) => {
    const sentence = sentences[id];
    if (!sentence) return;

    // Move back to bank
    setBank(prev => [...prev, { ...sentence, id: `bank-${Date.now()}`, section: 'MENTOR_SENTENCES' }]);

    // Remove from paragraphs
    setParagraphs(prev => prev.map(p => ({
      ...p,
      sentenceIds: p.sentenceIds.filter((sid: string) => sid !== id)
    })));
  };

  const renderSentence = (id: string) => {
    const s = sentences[id];
    if (!s) return null;
    const isEditing = editingMentorId === id;
    const isSelected = selectedSentenceId === id;
    const isReadingCurrent = readingSentenceId === id;

    if (isEditing) {
      return (
        <span
          key={id}
          contentEditable
          suppressContentEditableWarning
          autoFocus
          className={`sentence-card ${showColors ? getFunctionClass((s as any).currentFunction || s.function) : ''} editing`}
          onBlur={(e) => { updateMentorSentence(id, e.currentTarget.textContent || ""); setEditingMentorId(null); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); updateMentorSentence(id, (e.target as HTMLElement).textContent || ""); setEditingMentorId(null); }
            else if (e.key === 'Escape') { updateMentorSentence(id, preEditMentorText); setEditingMentorId(null); }
          }}
        >
          {s.currentText}
        </span>
      );
    }

    if (mode === 'PHRASE') {
      return (
        <span key={id} className={`phrase-chip-group ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedSentenceId(id)}>
          {s.chunks.map(chunk => (
            <span
              key={chunk.id}
              className={`functional-chip chip-${chunk.functionalCategory} ${editingChunkId === chunk.id ? 'editing' : ''}`}
              onClick={(e) => { e.stopPropagation(); setEditingChunkId(chunk.id); }}
            >
              {editingChunkId === chunk.id ? (
                <input
                  autoFocus
                  className="functional-chip-text"
                  defaultValue={chunk.text.trim()}
                  onBlur={(e) => { updateChunkText(id, chunk.id, e.target.value); setEditingChunkId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateChunkText(id, chunk.id, (e.target as HTMLInputElement).value); setEditingChunkId(null); } }}
                />
              ) : (
                <span className="functional-chip-text">{chunk.text}</span>
              )}
            </span>
          ))}
        </span>
      );
    }

    return (
      <DraggableSentence
        key={id}
        id={id}
        className={`sentence-card ${isSelected ? 'selected' : ''} ${isReadingCurrent ? 'reading' : ''} ${showColors ? getFunctionClass((s as any).currentFunction || s.function) : ''}`}
        disabled={false}
      >
        <span className="sentence-content" onClick={() => setSelectedSentenceId(id)} onDoubleClick={() => { setPreEditMentorText(s.currentText); setEditingMentorId(id); }}>
          {s.currentText}
          <button className="workspace-delete-btn" onClick={(e) => { e.stopPropagation(); handleRemoveSentence(id); }}>
            <X size={14} />
          </button>
        </span>
      </DraggableSentence>
    );
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    // Check if it's a bank sentence
    const bankItem = bank.find(s => s.id === activeId);
    if (bankItem) {
      return (
        <div className={`sentence-item bank-card ${getFunctionClass(bankItem.function)} dragging-overlay`}>
          {bankItem.currentText}
        </div>
      );
    }

    // Check if it's a workspace sentence
    const sentence = sentences[activeId];
    if (sentence) {
      return (
        <div className={`sentence-card ${getFunctionClass((sentence as any).currentFunction || sentence.function)} dragging-overlay`}>
          {sentence.currentText}
        </div>
      );
    }

    // Check if it's a paragraph (Discourse mode)
    const paragraph = paragraphs.find(p => p.id === activeId);
    if (paragraph) {
      return (
        <div className="discourse-chunk dragging-overlay" style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <div data-label="Paragraph">
            <p className="paragraph">
              {paragraph.sentenceIds.map((sid: string) => sentences[sid]?.currentText).join(' ')}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) return <div className="loading-screen">Loading lesson...</div>;

  if (loadError) {
    return (
      <div className="error-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '2rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>⚠️</div>
        <h1>Lesson Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>{loadError}</p>
        <button className="primary" onClick={() => window.location.search = ""}>Return to Landing Page</button>
      </div>
    );
  }

  if (!currentLesson) return <LandingPage onSelectLesson={handleSelectLesson} />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={hybridCollision}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className={`container ${mode === 'DISCOURSE' ? 'mode-discourse' : ''}`}>
        <div className="sticky-header">
          <header className="main-header">
            <div className="header-left">
              <button className={`icon-button ${isBankOpen ? 'active' : ''}`} onClick={() => setIsBankOpen(!isBankOpen)}>
                <BookOpen size={20} />
              </button>
              <h1>{currentLesson.mentorContent.title}</h1>
            </div>
            <div className="controls">
              <button className={`btn-mode ${mode === 'SENTENCE' ? 'active' : ''}`} onClick={() => setMode('SENTENCE')}><BookOpen size={20} /> Sentence Mode</button>
              <button className={`btn-mode ${mode === 'PHRASE' ? 'active' : ''}`} onClick={() => setMode('PHRASE')}><Plus size={20} /> Phrase Mode</button>
              <button className={`btn-mode ${mode === 'DISCOURSE' ? 'active' : ''}`} onClick={() => setMode('DISCOURSE')}><Layers size={20} /> Discourse Mode</button>
              <button className="secondary" onClick={readSentence} disabled={!selectedSentenceId}><Play size={20} /> Read Sentence</button>
              <button className="secondary" onClick={readFullText}><Play size={20} /> Read Full Text</button>
              <button className="primary" onClick={() => setView('FINISH')}><Check size={20} /> Finish</button>
            </div>
          </header>
        </div>

        <div className="legend-bar">
          {Object.entries(currentLesson.mentorContent.functionalLabels).map(([key, label]) => (
            <div key={key} className="legend-item">
              <span className={`legend-swatch ${getFunctionClass(key as SentenceFunction)}`}></span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {view === 'EDIT' ? (
          <div className="main-layout">
            <div className={`bank-area ${!isBankOpen ? 'closed' : ''}`}>
              <div className="bank-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="secondary" onClick={() => setIsBankOpen(false)} style={{ padding: '4px' }}><X size={16} /></button>
                  <h2 style={{ margin: 0 }}>Sentence Bank</h2>
                </div>
                <button className="secondary" onClick={addBankSentence}><Plus size={16} /> Add Sentence</button>
              </div>
              {isCreatorMenuOpen && (
                <div className="creator-menu">
                  <div className="creator-menu-title">Pick a Category</div>
                  <div className="creator-menu-grid">
                    {(['INTRO', 'SEQ', 'CAUSE_EFFECT', 'EXAMPLE_DETAIL', 'CONCLUSION'] as SentenceFunction[]).map(cat => (
                      <button key={cat} className={`creator-option ${cat.toLowerCase()}`} onClick={() => createTemplatedSentence(cat)}>
                        {currentLesson.mentorContent.functionalLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SortableContext items={bank.map(s => s.id)} strategy={verticalListSortingStrategy} id="bank-droppable">
                <div className="bank-sections">
                  {(['STARTERS', 'MY_SENTENCES', 'MENTOR_SENTENCES', 'TRASH'] as BankSection[]).map(section => {
                    const items = bank.filter(b => b.section === section);
                    if (items.length === 0 && section !== 'STARTERS') return null;
                    const titles = { STARTERS: "Starters", MY_SENTENCES: "My Sentences", MENTOR_SENTENCES: "Mentor Sentences", TRASH: "Trash" };
                    return (
                      <div key={section} className="bank-section">
                        <h3>{titles[section]}</h3>
                        <div className="bank-grid">
                          {items.map(s => (
                            <DraggableSentence
                              key={s.id}
                              id={s.id}
                              className={`sentence-item bank-card ${getFunctionClass(s.function)} ${editingBankId === s.id ? 'editing' : ''}`}
                            >
                              <div onDoubleClick={() => { setPreEditBankText(s.currentText); setEditingBankId(s.id); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {editingBankId === s.id ? (
                                  <input autoFocus value={s.currentText} onChange={(e) => updateBankSentence(s.id, e.target.value)} onBlur={() => setEditingBankId(null)} onKeyDown={(e) => e.key === 'Enter' ? setEditingBankId(null) : e.key === 'Escape' && (updateBankSentence(s.id, preEditBankText), setEditingBankId(null))} />
                                ) : s.currentText}
                                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); section === 'TRASH' ? deletePermanently(s.id) : moveToTrash(s.id); }}><X size={14} /></button>
                              </div>
                            </DraggableSentence>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </div>
            <div className="workspace">
              <div className="mentor-area paragraph-canvas">
                {paragraphs.map((p, pIdx) => {
                  const isDiscourse = mode === 'DISCOURSE';
                  const paragraphContent = (
                    <SortableContext items={p.sentenceIds} strategy={rectSortingStrategy} id={`p-${p.id}`}>
                      {p.sentenceIds.map((id: string) => <React.Fragment key={id}>{renderSentence(id)}</React.Fragment>)}
                    </SortableContext>
                  );

                  return isDiscourse ? (
                    <DraggableSentence key={p.id} id={p.id} className="discourse-chunk">
                      <div data-label={`Paragraph ${pIdx + 1}`}><p className="paragraph">{paragraphContent}</p></div>
                    </DraggableSentence>
                  ) : (
                    <div key={p.id} className="composition-paragraph-wrapper">
                      <div className="paragraph-label">Paragraph {pIdx + 1}</div>
                      <p className="paragraph">{paragraphContent}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="finish-view">
            <div className="finish-header">
              <button className="secondary" onClick={() => setView('EDIT')}><RefreshCw size={20} /> Back</button>
              <div className="finish-actions">
                <button className="secondary" onClick={copyToClipboard}><Clipboard size={20} /> Copy</button>
                <button className="secondary" onClick={downloadTxt}><Download size={20} /> Download</button>
                <button className="primary" onClick={startFresh}><RefreshCw size={20} /> Reset</button>
              </div>
            </div>
            <div className={`finish-text ${showColors ? 'showing-colors' : ''}`}>
              <div className="finish-content">
                <h2>{currentLesson.mentorContent.title}</h2>
                {paragraphs.map((p: any) => (
                  <p key={p.id} className="finish-paragraph">
                    {p.sentenceIds.map((id: string) => (
                      <span key={id} className={showColors ? getFunctionClass(sentences[id].currentFunction || sentences[id].function) : ''}>
                        {sentences[id].currentText}{' '}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="view-toggle" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: 'full', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <input type="checkbox" checked={showColors} onChange={() => setShowColors(!showColors)} />
          <span>Show Colors</span>
        </label>
      </div>
      <DragOverlay
        dropAnimation={null}
        style={{
          position: 'fixed',
          zIndex: 9999,
        }}
      >
        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
};

export default App;
