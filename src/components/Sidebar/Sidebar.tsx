import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { TagPill } from '../TagPill/TagPill';
import { getTagDotColor } from '../../utils/colors';
import './Sidebar.css';

export function Sidebar() {
  const cards = useStore((s) => s.cards);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setMatchingCardIds = useStore((s) => s.setMatchingCardIds);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const setPan = useStore((s) => s.setPan);
  const canvas = useStore((s) => s.canvas);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    cards.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [cards]);

  // Recent cards (sorted by updatedAt, last 8)
  const recentCards = useMemo(() => {
    return [...cards]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8);
  }, [cards]);

  // Filter by tag
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    const matching = cards.filter((c) => c.tags.includes(tag)).map((c) => c.id);
    setMatchingCardIds(matching);
  };

  // Navigate to card
  const handleRecentClick = (card: typeof cards[0]) => {
    setActiveCard(card.id);
    // Pan canvas so the card is roughly centered
    const centerX = -(card.x * canvas.zoom) + window.innerWidth / 2 - 220; // account for sidebar
    const centerY = -(card.y * canvas.zoom) + window.innerHeight / 2;
    setPan(centerX, centerY);
  };

  return (
    <div className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      {/* Tags */}
      <div className="sidebar-section">
        <div className="sidebar-title">Tags</div>
        {allTags.length > 0 ? (
          <div className="sidebar-tags">
            {allTags.map((tag) => (
              <TagPill key={tag} tag={tag} clickable onClick={() => handleTagClick(tag)} />
            ))}
          </div>
        ) : (
          <div className="sidebar-empty">No tags yet</div>
        )}
      </div>

      {/* Recent */}
      <div className="sidebar-section">
        <div className="sidebar-title">Recent</div>
        {recentCards.length > 0 ? (
          <ul className="sidebar-recent-list">
            {recentCards.map((card) => (
              <li
                key={card.id}
                className="sidebar-recent-item"
                onClick={() => handleRecentClick(card)}
              >
                <span
                  className="sidebar-recent-dot"
                  style={{
                    backgroundColor: card.tags.length > 0
                      ? getTagDotColor(card.tags[0])
                      : 'var(--text-muted)',
                  }}
                />
                <span className="sidebar-recent-title">{card.title || 'Untitled'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sidebar-empty">No cards yet</div>
        )}
      </div>
    </div>
  );
}
