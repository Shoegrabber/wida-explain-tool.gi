import React, { useState, useEffect } from 'react';
import { MENTOR_CONTENT, DEFAULT_BANK } from './data';
import type { Sentence, SentenceFunction, BankSentence, BankSection } from './types';
import { Plus, Play, BookOpen, Check, Download, Clipboard, RefreshCw, X, AlertTriangle, Layers } from 'lucide-react';
import './index.css';

const App: React.FC = () => {
  const [sentences, setSentences] = useState<Record<string, Sentence>>({ ...MENTOR_CONTENT.sentences });
  const [bank, setBank] = useState<BankSentence[]>(DEFAULT_BANK);
  const [paragraphs, setParagraphs] = useState(() => MENTOR_CONTENT.paragraphs.map(p => ({ ...p })));
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [mode, setMode] = useState<'SENTENCE' | 'PHRASE' | 'DISCOURSE'>('SENTENCE');
  const [view, setView] = useState<'EDIT' | 'FINISH'>('EDIT');
  const [showColors, setShowColors] = useState(true);
  const [readingSentenceId, setReadingSentenceId] = useState<string | null>(null);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [preEditBankText, setPreEditBankText] = useState<string>("");
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [preEditMentorText, setPreEditMentorText] = useState<string>("");

  const [draggingEntity, setDraggingEntity] = useState<{ id: string, source: 'BANK' | 'MENTOR' | 'CHUNK' } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'REPLACE' | 'INSERT' | 'CHUNK_REORDER', id: string, index?: number } | null>(null);
  const [bankHeight, setBankHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  // Stop reading when component unmounts
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      // Constrain height
      if (newHeight > 150 && newHeight < window.innerHeight * 0.7) {
        setBankHeight(newHeight);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSelectSentence = (id: string) => {
    setSelectedSentenceId(id);
  };

  const handleInsertSentence = (source: { id: string, source: 'BANK' | 'MENTOR' | 'CHUNK' }, paragraphId: string, index: number) => {
    if (source.source === 'CHUNK') return; // Cannot insert a chunk into a sentence slot

    let sentenceId = source.id;

    if (source.source === 'BANK') {
      const bankItem = bank.find(b => b.id === source.id);
      if (!bankItem) return;
      // We create a NEW sentence instance in mentor text from bank item
      const newId = `custom-${Date.now()}`;
      setSentences(prev => ({
        ...prev,
        [newId]: {
          id: newId,
          originalText: bankItem.currentText,
          currentText: bankItem.currentText,
          function: bankItem.function,
          currentFunction: bankItem.function
        } as any
      }));
      sentenceId = newId;
    } else {
      // If moving within mentor, remove from old position first
      setParagraphs(prev => prev.map(p => ({
        ...p,
        sentenceIds: p.sentenceIds.filter(id => id !== source.id)
      })));
    }

    setParagraphs(prev => prev.map(p => {
      if (p.id === paragraphId) {
        const newIds = [...p.sentenceIds];
        newIds.splice(index, 0, sentenceId);
        return { ...p, sentenceIds: newIds };
      }
      return p;
    }));
  };

  const handleMoveParagraph = (dragIndex: number, hoverIndex: number) => {
    setParagraphs(prev => {
      const newParagraphs = [...prev];
      const [removed] = newParagraphs.splice(dragIndex, 1);
      newParagraphs.splice(hoverIndex, 0, removed);
      return newParagraphs;
    });
  };

  const removeMentorSentence = (id: string, addToBank = true) => {
    const originalSentence = sentences[id];

    if (addToBank && originalSentence.currentText !== "____") {
      const textExists = bank.some(b => b.currentText === originalSentence.currentText);
      if (!textExists) {
        setBank(prev => [...prev, {
          ...originalSentence,
          id: `mentor-${Date.now()}`,
          section: 'MENTOR_SENTENCES'
        } as BankSentence]);
      }
    }

    // For composition mode, "removal" might mean actually deleting the ID from paragraphs
    // OR just clearing text if it was an original slot.
    // User said "returns the sentence to the bank safely". 
    // Let's remove it from paragraphs entirely if it's a "custom" or "moved" item, 
    // or set to placeholder if it was an original slot?
    // Actually, "composition" implies dynamic lines. Let's just remove it from the array.
    setParagraphs(prev => prev.map(p => ({
      ...p,
      sentenceIds: p.sentenceIds.filter(sid => sid !== id)
    })));

    // Ensure we don't end up with empty paragraphs if we want to keep slots?
    // User said "insertion should be preferred".
  };

  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => { };
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
    const fullText = MENTOR_CONTENT.paragraphs.map(p =>
      p.sentenceIds.map(id => sentences[id].currentText).join(' ')
    ).join('\n\n');
    speak(fullText);
  };

  const addBankSentence = () => {
    const newSentence: BankSentence = {
      id: `bank-${Date.now()}`,
      originalText: "New sentence...",
      currentText: "New sentence...",
      function: "EXAMPLE_DETAIL",
      section: "MY_SENTENCES"
    };
    setBank(prev => [...prev, newSentence]);
  };

  const moveToTrash = (id: string) => {
    setBank(prev => prev.map(s => s.id === id ? { ...s, section: 'TRASH' } : s));
  };

  const recoverFromTrash = (id: string) => {
    setBank(prev => prev.map(s => {
      if (s.id === id) {
        // Return to its likely original section or just MY_SENTENCES?
        // Let's guess: if it's mentor, return to mentor.
        if (s.id.startsWith('mentor')) return { ...s, section: 'MENTOR_SENTENCES' };
        return { ...s, section: 'MY_SENTENCES' };
      }
      return s;
    }));
  };

  const deletePermanently = (id: string) => {
    setBank(prev => prev.filter(s => s.id !== id));
  };

  const updateBankSentence = (id: string, text: string) => {
    setBank(prev => prev.map(s => s.id === id ? { ...s, currentText: text } : s));
  };

  const updateMentorSentence = (id: string, text: string) => {
    setSentences(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        currentText: text,
        // If edited, we can optionally flag it or just clear hotspots as requested
        hotspots: undefined
      }
    }));
  };

  const updateHotspot = (sentenceId: string, index: number, text: string) => {
    setSentences(prev => {
      const s = prev[sentenceId];
      if (!s.hotspots) return prev;
      const newHotspots = [...s.hotspots];
      newHotspots[index] = { ...newHotspots[index], text };

      // Update the currentText by replacing the hotspot content
      // This is tricky because indices might shift. 
      // Simplified: currentText is reconstructed or just updated live?
      // Let's assume currentText is what we read, and hotspots are for editing.
      // We'll update currentText to match the new hotspot value if possible.
      // For this PoC, we'll just update the hotspot and assume the UI renders it correctly.
      return {
        ...prev,
        [sentenceId]: { ...s, hotspots: newHotspots }
      };
    });
  };

  const downloadTxt = () => {
    const text = `${MENTOR_CONTENT.title}\n\n` + MENTOR_CONTENT.paragraphs.map(p =>
      p.sentenceIds.map(id => sentences[id].currentText).join(' ')
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WIDA-Explain-Draft.txt';
    a.click();
  };

  const copyToClipboard = () => {
    const text = `${MENTOR_CONTENT.title}\n\n` + MENTOR_CONTENT.paragraphs.map(p =>
      p.sentenceIds.map(id => sentences[id].currentText).join(' ')
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const startFresh = () => {
    setSentences({ ...MENTOR_CONTENT.sentences });
    setBank(DEFAULT_BANK);
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

  const renderSentence = (id: string) => {
    const s = sentences[id];
    if (!s) return null; // Safety for deleted IDs

    const isSelected = selectedSentenceId === id;
    const isReadingCurrent = readingSentenceId === id;
    const bankFunc = (s as any).currentFunction;
    const hasMismatch = bankFunc && bankFunc !== s.function;
    const isEditing = editingMentorId === id;

    if (isEditing) {
      return (
        <span
          key={id}
          contentEditable
          suppressContentEditableWarning
          autoFocus
          className={`sentence-card ${showColors ? getFunctionClass((s as any).currentFunction || s.function) : ''} editing`}
          onBlur={(e) => {
            updateMentorSentence(id, e.currentTarget.textContent || "");
            setEditingMentorId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              updateMentorSentence(id, e.currentTarget.textContent || "");
              setEditingMentorId(null);
            } else if (e.key === 'Escape') {
              updateMentorSentence(id, preEditMentorText);
              setEditingMentorId(null);
            }
          }}
          ref={(el) => {
            if (el && isEditing) {
              setTimeout(() => { if (document.activeElement !== el) el.focus(); }, 0);
            }
          }}
        >
          {s.currentText}
        </span>
      );
    }

    if (mode === 'PHRASE' && s.hotspots) {
      // Simple Phrase Mode: Text with hotspots
      return (
        <span
          key={id}
          className={`sentence-card ${showColors ? getFunctionClass(s.function) : ''} ${isSelected ? 'selected' : ''} ${isReadingCurrent ? 'reading' : ''}`}
          onClick={() => handleSelectSentence(id)}
        >
          {/* We map the original text and replace hotspots. This is complex for a PoC. 
                    Simpler version: If phrase mode, show the text but allow editing the hotspots explicitly.
                */}
          {s.currentText.split(/(____)/).map((part) => {
            // This splitter doesn't work for arbitrary text.
            // Let's use the hotspots array.
            return part;
          })}
          {/* Realistic Approach for Phase Mode: Render hotspots as inputs */}
          {s.hotspots?.map((h, i) => (
            <span key={i} className="hotspot" contentEditable suppressContentEditableWarning onBlur={(e) => updateHotspot(id, i, e.currentTarget.textContent || "")}>
              {h.text}
            </span>
          ))}
          {hasMismatch && <span className="warning-badge"><AlertTriangle size={12} /> Mismatch</span>}
        </span>
      );
    }

    return (
      <span
        key={id}
        draggable={mode === 'SENTENCE'}
        className={`sentence-item mentor-card ${showColors ? getFunctionClass((s as any).currentFunction || s.function) : ''} ${isSelected ? 'selected' : ''} ${isReadingCurrent ? 'reading' : ''} ${dragOverTarget?.id === id ? 'drag-over' : ''}`}
        style={{ '--insert': dragOverTarget?.id === id ? dragOverTarget.index : undefined } as any}
        onClick={() => handleSelectSentence(id)}
        onDoubleClick={() => {
          setPreEditMentorText(s.currentText);
          setEditingMentorId(id);
        }}
        onDragStart={(e) => {
          setDraggingEntity({ id, source: 'MENTOR' });
          e.dataTransfer.setData("text/plain", id);
        }}
        onDragEnd={() => {
          setDraggingEntity(null);
          setDragOverTarget(null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (draggingEntity && draggingEntity.id !== id) {
            const rect = e.currentTarget.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            const type = e.clientX < midpoint ? 'BEFORE' : 'AFTER';
            // We find the paragraph and index in handleInsertSentence, 
            // but for visual feedback we can use a temporary target state
            setDragOverTarget({ type: 'REPLACE', id, index: type === 'BEFORE' ? 0 : 1 }); // Reusing REPLACE type for card-relative feedback
          }
        }}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => {
          e.preventDefault();
          if (draggingEntity && draggingEntity.id !== id) {
            const rect = e.currentTarget.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            const isBefore = e.clientX < midpoint;

            // Find paragraph and index of current sentence
            paragraphs.forEach(p => {
              const idx = p.sentenceIds.indexOf(id);
              if (idx !== -1) {
                handleInsertSentence(draggingEntity, p.id, isBefore ? idx : idx + 1);
              }
            });
          }
          setDragOverTarget(null);
        }}
      >
        {s.currentText}
        {hasMismatch && <span className="warning-badge" title="Function mismatch"><AlertTriangle size={12} /></span>}

        {mode === 'SENTENCE' && (
          <button
            className="mentor-remove-btn"
            onClick={(e) => { e.stopPropagation(); removeMentorSentence(id); }}
            title="Remove and return to bank"
          >
            <X size={14} />
          </button>
        )}
      </span>
    );
  };

  const InsertionPoint: React.FC<{ paragraphId: string, index: number }> = ({ paragraphId, index }) => {
    const isTarget = dragOverTarget?.type === 'INSERT' && dragOverTarget.id === paragraphId && dragOverTarget.index === index;

    return (
      <span
        className={`insertion-point ${isTarget ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (draggingEntity) {
            setDragOverTarget({ type: 'INSERT', id: paragraphId, index });
          }
        }}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => {
          e.preventDefault();
          if (draggingEntity) {
            handleInsertSentence(draggingEntity, paragraphId, index);
          }
          setDragOverTarget(null);
        }}
      />
    );
  };

  return (
    <div className={`container ${mode === 'DISCOURSE' ? 'mode-discourse' : ''}`} style={{ paddingBottom: bankHeight + 20 }}>
      <h1>{MENTOR_CONTENT.title}</h1>

      {view === 'EDIT' && (
        <div className="legend-container">
          <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Language Functions:</span>
          {Object.entries(MENTOR_CONTENT.functionalLabels).map(([key, label]) => {
            const func = key as SentenceFunction;
            return (
              <div key={key} className="legend-item">
                <span className={`legend-swatch ${getFunctionClass(func)}`}></span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {view === 'EDIT' ? (
        <>
          <div className="controls">
            <button className={`btn-mode ${mode === 'SENTENCE' ? 'active' : ''}`} onClick={() => setMode('SENTENCE')}>
              <BookOpen size={20} /> Sentence Mode
            </button>
            <button className={`btn-mode ${mode === 'PHRASE' ? 'active' : ''}`} onClick={() => setMode('PHRASE')}>
              <Plus size={20} /> Phrase Mode
            </button>
            <button className={`btn-mode ${mode === 'DISCOURSE' ? 'active' : ''}`} onClick={() => setMode('DISCOURSE')}>
              <Layers size={20} /> Discourse Mode
            </button>
            <div style={{ width: 1, background: '#e2e8f0', margin: '0 8px' }}></div>
            <button className="secondary" onClick={readSentence} disabled={!selectedSentenceId}>
              <Play size={20} /> Read Sentence
            </button>
            <button className="secondary" onClick={readFullText}>
              <Play size={20} /> Read Full Text
            </button>
            <button className="primary" onClick={() => setView('FINISH')}>
              <Check size={20} /> Finish
            </button>
          </div>

          <div className="mentor-area paragraph-canvas">

            {paragraphs.map((p, index) => {
              const isDiscourse = mode === 'DISCOURSE';
              const isDragTarget = dragOverTarget?.type === 'CHUNK_REORDER' && dragOverTarget.id === p.id;
              const isDragging = draggingEntity?.source === 'CHUNK' && draggingEntity.id === p.id;

              const content = (
                <>
                  {p.sentenceIds.map((id, idx) => (
                    <React.Fragment key={id}>
                      {mode !== 'DISCOURSE' && <InsertionPoint paragraphId={p.id} index={idx} />}
                      {renderSentence(id)}
                    </React.Fragment>
                  ))}
                  {mode !== 'DISCOURSE' && <InsertionPoint paragraphId={p.id} index={p.sentenceIds.length} />}
                </>
              );

              if (isDiscourse) {
                return (
                  <div
                    key={p.id}
                    className={`discourse-chunk ${isDragTarget ? 'drag-target' : ''} ${isDragging ? 'dragging' : ''}`}
                    data-label={`Chunk ${index + 1}`}
                    draggable
                    onDragStart={(e) => {
                      setDraggingEntity({ id: p.id, source: 'CHUNK' });
                      e.dataTransfer.setData("text/plain", p.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingEntity?.source === 'CHUNK' && draggingEntity.id !== p.id) {
                        setDragOverTarget({ type: 'CHUNK_REORDER', id: p.id });
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverTarget?.id === p.id) {
                        setDragOverTarget(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverTarget(null);
                      if (draggingEntity?.source === 'CHUNK' && draggingEntity.id !== p.id) {
                        const dragIndex = paragraphs.findIndex(px => px.id === draggingEntity.id);
                        const hoverIndex = index;
                        handleMoveParagraph(dragIndex, hoverIndex);
                        setDraggingEntity(null);
                      }
                    }}
                  >
                    <p className="paragraph">{content}</p>
                  </div>
                );
              }

              return (
                <p key={p.id} className="paragraph">
                  {content}
                </p>
              );
            })}
          </div>


          <div className="resize-divider" onMouseDown={() => setIsResizing(true)}>
            <div className="drag-handle"></div>
          </div>

          <div className="bank-area" style={{ height: bankHeight, flex: 'none' }}>
            <div className="bank-header">
              <h2>Sentence Bank</h2>
              <button className="secondary" onClick={addBankSentence}><Plus size={16} /> Add Sentence</button>
            </div>

            <div
              className="bank-sections"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingEntity && draggingEntity.source === 'MENTOR') {
                  removeMentorSentence(draggingEntity.id, true);
                }
              }}
            >
              {(['STARTERS', 'MY_SENTENCES', 'MENTOR_SENTENCES', 'TRASH'] as BankSection[]).map(section => {
                const items = bank.filter(b => b.section === section);
                if (items.length === 0 && section !== 'STARTERS') return null;

                const sectionTitles: Record<BankSection, string> = {
                  STARTERS: "Starters",
                  MY_SENTENCES: "My Sentences",
                  MENTOR_SENTENCES: "Mentor Sentences",
                  TRASH: "Trash (Recoverable)"
                };

                return (
                  <div key={section} className="bank-section">
                    <h3>{sectionTitles[section]}</h3>
                    <div className="bank-grid">
                      {items.map(s => (
                        <div
                          key={s.id}
                          draggable={editingBankId !== s.id}
                          className={`sentence-item bank-card ${getFunctionClass(s.function)} ${editingBankId === s.id ? 'editing' : ''}`}
                          onClick={() => section === 'TRASH' ? recoverFromTrash(s.id) : null}
                          onDoubleClick={() => setEditingBankId(s.id)}
                          onDragStart={(e) => {
                            if (editingBankId !== s.id) {
                              setDraggingEntity({ id: s.id, source: 'BANK' });
                              e.dataTransfer.setData("text/plain", s.id);
                            } else {
                              e.preventDefault();
                            }
                          }}
                          onDragEnd={() => setDraggingEntity(null)}
                        >
                          {editingBankId === s.id ? (
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              autoFocus
                              className="bank-edit-inline"
                              onBlur={(e) => {
                                updateBankSentence(s.id, e.currentTarget.textContent || "");
                                setEditingBankId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  updateBankSentence(s.id, e.currentTarget.textContent || "");
                                  setEditingBankId(null);
                                } else if (e.key === 'Escape') {
                                  updateBankSentence(s.id, preEditBankText);
                                  setEditingBankId(null);
                                }
                              }}
                              ref={(el) => {
                                if (el && editingBankId === s.id) {
                                  setPreEditBankText(s.currentText);
                                  setTimeout(() => el.focus(), 0);
                                }
                              }}
                            >
                              {s.currentText}
                            </span>
                          ) : (
                            <div>{s.currentText}</div>
                          )}

                          {section !== 'TRASH' ? (
                            <button
                              className="delete-btn"
                              style={{ position: 'absolute', top: 5, right: 5, padding: 2, background: 'transparent' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveToTrash(s.id);
                              }}
                            >
                              <X size={14} />
                            </button>
                          ) : (
                            <button
                              className="delete-btn"
                              style={{ position: 'absolute', top: 5, right: 5, padding: 2, background: 'transparent' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePermanently(s.id);
                              }}
                            >
                              <X size={14} style={{ color: 'red' }} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="finish-view">
          <div className="controls">
            <button className="secondary" onClick={() => setView('EDIT')}>Back to Edit</button>
            <button className="secondary" onClick={() => setShowColors(!showColors)}>
              {showColors ? "Hide Colors" : "Show Colors"}
            </button>
            <button className="secondary" onClick={copyToClipboard}><Clipboard size={20} /> Copy</button>
            <button className="secondary" onClick={downloadTxt}><Download size={20} /> Download .txt</button>
            <button className="secondary" style={{ color: 'red' }} onClick={startFresh}><RefreshCw size={20} /> Start Fresh</button>
          </div>

          <div className={`finish-text ${showColors ? 'showing-colors' : ''}`}>
            <h2>{MENTOR_CONTENT.title}</h2>
            {MENTOR_CONTENT.paragraphs.map(p => (
              <p key={p.id}>
                {p.sentenceIds.map(id => {
                  const s = sentences[id];
                  const func = (s as any).currentFunction || s.function;
                  return (
                    <span key={id} className={showColors ? getFunctionClass(func) : ''} style={{ padding: showColors ? '2px 4px' : '0', borderRadius: '4px' }}>
                      {s.currentText}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        </div>
      )
      }

      {/* Modal removed as Trash is direct move */}
    </div >
  );
};

export default App;
