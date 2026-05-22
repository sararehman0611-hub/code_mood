import { getTagColor } from '../../utils/colors';
import './TagPill.css';

interface TagPillProps {
  tag: string;
  removable?: boolean;
  clickable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function TagPill({ tag, removable, clickable, onRemove, onClick }: TagPillProps) {
  const color = getTagColor(tag);

  const className = [
    'tag-pill',
    removable ? 'removable' : '',
    clickable ? 'clickable' : '',
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (removable && onRemove) onRemove();
    else if (clickable && onClick) onClick();
  };

  return (
    <span
      className={className}
      style={{
        background: color.bg,
        color: color.text,
        borderColor: color.border,
      }}
      onClick={handleClick}
    >
      {tag}
      {removable && <span className="tag-remove">×</span>}
    </span>
  );
}
