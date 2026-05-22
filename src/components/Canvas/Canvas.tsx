import { useRef, useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { SnippetCard } from '../Card/SnippetCard';
import { MIN_ZOOM, MAX_ZOOM } from '../../utils/constants';
import './Canvas.css';

export function Canvas() {
  const canvas = useStore((s) => s.canvas);
  const setPan = useStore((s) => s.setPan);
  const setZoom = useStore((s) => s.setZoom);
  const cards = useStore((s) => s.cards);
  const groups = useStore((s) => s.groups);
  const activeCardId = useStore((s) => s.activeCardId);
  const setActiveCard = useStore((s) => s.setActiveCard);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });

  // Update grid offset when panning
  useEffect(() => {
    setGridOffset({
      x: canvas.panX % (30 * canvas.zoom),
      y: canvas.panY % (30 * canvas.zoom),
    });
  }, [canvas.panX, canvas.panY, canvas.zoom]);

  // Pan: mouse drag on empty canvas
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan if clicking directly on canvas, not on a card
      if ((e.target as HTMLElement).closest('.snippet-card')) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { x: canvas.panX, y: canvas.panY };
    },
    [canvas.panX, canvas.panY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(panOrigin.current.x + dx, panOrigin.current.y + dy);
    },
    [setPan]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Click on empty canvas = deselect active card
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.snippet-card')) return;
      setActiveCard(null);
    },
    [setActiveCard]
  );

  // Zoom: scroll wheel toward cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvas.zoom + delta));
      const scale = newZoom / canvas.zoom;

      const newPanX = mouseX - scale * (mouseX - canvas.panX);
      const newPanY = mouseY - scale * (mouseY - canvas.panY);

      setZoom(newZoom);
      setPan(newPanX, newPanY);
    },
    [canvas.zoom, canvas.panX, canvas.panY, setZoom, setPan]
  );

  // Prevent default scroll on the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`canvas-container ${activeCardId ? 'has-active-card' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      {/* Dot grid */}
      <div
        className="canvas-grid"
        style={{
          backgroundPosition: `${gridOffset.x}px ${gridOffset.y}px`,
          backgroundSize: `${30 * canvas.zoom}px ${30 * canvas.zoom}px`,
        }}
      />

      {/* Transform layer */}
      <div
        className="canvas-transform"
        style={{
          transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
        }}
      >
        {/* Groups */}
        {groups.map((group) => (
          <div
            key={group.id}
            className="canvas-group"
            style={{
              left: group.x,
              top: group.y,
              width: group.width,
              height: group.height,
              borderColor: `${group.color}33`,
            }}
          >
            <span className="canvas-group-label" style={{ color: `${group.color}99` }}>
              {group.label}
            </span>
          </div>
        ))}

        {/* Cards */}
        {cards.map((card) => (
          <SnippetCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
