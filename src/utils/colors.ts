// Curated tag color palette — each tag gets a deterministic color based on its name
const TAG_COLORS = [
  { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },   // green
  { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },   // blue
  { bg: 'rgba(244, 114, 182, 0.15)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' }, // pink
  { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },   // orange
  { bg: 'rgba(167, 139, 250, 0.15)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' }, // purple
  { bg: 'rgba(45, 212, 191, 0.15)', text: '#2dd4bf', border: 'rgba(45, 212, 191, 0.3)' },   // teal
  { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.3)' },   // yellow
  { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' }, // red
  { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },   // sky
  { bg: 'rgba(232, 121, 249, 0.15)', text: '#e879f9', border: 'rgba(232, 121, 249, 0.3)' }, // fuchsia
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTagColor(tag: string) {
  const index = hashString(tag) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

// Dot color for the recent list sidebar
export function getTagDotColor(tag: string): string {
  return getTagColor(tag).text;
}
