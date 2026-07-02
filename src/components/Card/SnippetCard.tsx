import { useRef, useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TagPill } from '../TagPill/TagPill';
import { LANGUAGES, MIN_CARD_WIDTH, MIN_CARD_HEIGHT } from '../../utils/constants';
import type { Card } from '../../types';
import './Card.css';

// Lazy-load Monaco to avoid initial bundle bloat
import Editor from '@monaco-editor/react';

interface SnippetCardProps {
  card: Card;
}

export function SnippetCard({ card }: SnippetCardProps) {
  const activeCardId = useStore((s) => s.activeCardId);
  const matchingCardIds = useStore((s) => s.matchingCardIds);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const updateCard = useStore((s) => s.updateCard);
  const deleteCard = useStore((s) => s.deleteCard);
  const moveCard = useStore((s) => s.moveCard);
  const resizeCard = useStore((s) => s.resizeCard);
  const addTag = useStore((s) => s.addTag);
  const removeTag = useStore((s) => s.removeTag);
  const canvas = useStore((s) => s.canvas);

  const isActive = activeCardId === card.id;
  const isDimmed = matchingCardIds !== null && !matchingCardIds.includes(card.id);

  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, cardX: 0, cardY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Copy to clipboard
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }, [card.code]);

  // Delete
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(card.id);
  }, [card.id, deleteCard]);

  // Click on card to activate (edit mode)
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || isResizing) return;
    e.stopPropagation();
    setActiveCard(card.id);
  }, [card.id, setActiveCard, isDragging, isResizing]);

  // === DRAG LOGIC ===
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('input, select, button, .card-editor')) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        cardX: card.x,
        cardY: card.y,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - dragStart.current.x) / canvas.zoom;
        const dy = (ev.clientY - dragStart.current.y) / canvas.zoom;
        moveCard(card.id, dragStart.current.cardX + dx, dragStart.current.cardY + dy);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [card.id, card.x, card.y, canvas.zoom, moveCard]
  );

  // === RESIZE LOGIC ===
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: card.width,
        h: card.height,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - resizeStart.current.x) / canvas.zoom;
        const dy = (ev.clientY - resizeStart.current.y) / canvas.zoom;
        const newW = Math.max(MIN_CARD_WIDTH, resizeStart.current.w + dx);
        const newH = Math.max(MIN_CARD_HEIGHT, resizeStart.current.h + dy);
        resizeCard(card.id, newW, newH);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [card.id, card.width, card.height, canvas.zoom, resizeCard]
  );

  // Tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      addTag(card.id, tagInput.trim().toLowerCase());
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && card.tags.length > 0) {
      removeTag(card.id, card.tags[card.tags.length - 1]);
    }
  };

  // Click outside to deactivate — handled by Canvas click

  // Monaco change handler
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        updateCard(card.id, { code: value });
      }
    },
    [card.id, updateCard]
  );



  const className = [
    'snippet-card',
    isActive ? 'active' : '',
    isDimmed ? 'dimmed' : '',
    isDragging ? 'dragging' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
        height: isActive ? Math.max(card.height, 320) : card.height,
      }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="card-header" onMouseDown={handleDragStart}>
        <input
          className="card-title"
          value={card.title}
          placeholder="Untitled"
          onChange={(e) => updateCard(card.id, { title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="card-header-actions">
          <button
            className={`card-action-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
          <button className="card-action-btn" onClick={handleDelete} title="Delete card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code area */}
      {isActive ? (
        <div className="card-editor">
          <Editor
            height="100%"
            language={card.language}
            value={card.code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 8, bottom: 8 },
              renderLineHighlight: 'none',
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
              contextmenu: false,
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        <div className="card-code-preview" onClick={handleCardClick}>
          {card.code || '// Click to start coding...'}
        </div>
      )}

      {/* Tags */}
      <div className="card-tags">
        {card.tags.map((tag) => (
          <TagPill
            key={tag}
            tag={tag}
            removable={isActive}
            onRemove={() => removeTag(card.id, tag)}
          />
        ))}
        {isActive && (
          <input
            className="card-tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="+ tag"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <select
          className="card-language-select"
          value={card.language}
          onChange={(e) => updateCard(card.id, { language: e.target.value })}
          onClick={(e) => e.stopPropagation()}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resize handle */}
      <div className="card-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
}
