import { useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { downloadJSON } from '../../utils/exportImport';
import Fuse from 'fuse.js';
import './Toolbar.css';

export function Toolbar() {
  const cards = useStore((s) => s.cards);
  const groups = useStore((s) => s.groups);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setMatchingCardIds = useStore((s) => s.setMatchingCardIds);
  const addCard = useStore((s) => s.addCard);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  const searchRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<typeof cards[0]> | null>(null);

  // Initialize fuse
  useEffect(() => {
    fuseRef.current = new Fuse(cards, {
      keys: ['title', 'code', 'tags'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [cards]);

  // Search handler
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setMatchingCardIds(null);
        return;
      }
      if (fuseRef.current) {
        const results = fuseRef.current.search(query);
        setMatchingCardIds(results.map((r) => r.item.id));
      }
    },
    [setSearchQuery, setMatchingCardIds]
  );

  // Keyboard shortcut: Cmd+K focuses search, Cmd+N creates card
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        addCard();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addCard]);

  // Export
  const handleExport = () => {
    downloadJSON(cards, groups);
  };



  return (
    <div className="toolbar">
      <span className="toolbar-logo">moodboard</span>

      <div className="toolbar-divider" />

      <button className="toolbar-btn" onClick={() => addCard()} title="New card (⌘N)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        new card
      </button>

      <button
        className={`toolbar-btn ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        title="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        tags
      </button>

      <div className="toolbar-spacer" />

      <div className="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          className="toolbar-search-input"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {!searchQuery && <span className="search-shortcut">⌘K</span>}
      </div>

      <div className="toolbar-divider" />


      <button className="toolbar-icon-btn" onClick={handleExport} title="Export JSON">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      <div className="toolbar-divider" />

      <span className="toolbar-stats">
        {cards.length} card{cards.length !== 1 ? 's' : ''} · {groups.length} group{groups.length !== 1 ? 's' : ''}
      </span>


    </div>
  );
}
