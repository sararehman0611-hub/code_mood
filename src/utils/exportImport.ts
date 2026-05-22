import type { Card, Group } from '../types';
import { STORAGE_KEY } from './constants';

interface ExportData {
  version: 1;
  exportedAt: string;
  cards: Card[];
  groups: Group[];
}

export function exportToJSON(cards: Card[], groups: Group[]): string {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
    groups,
  };
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(cards: Card[], groups: Group[]) {
  const json = exportToJSON(cards, groups);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code-mood-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportJSON(json: string): { cards: Card[]; groups: Group[] } | null {
  try {
    const data = JSON.parse(json) as ExportData;
    if (!data.cards || !Array.isArray(data.cards)) return null;
    return {
      cards: data.cards,
      groups: data.groups || [],
    };
  } catch {
    return null;
  }
}

export function saveToStorage(cards: Card[], groups: Group[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards, groups }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage(): { cards: Card[]; groups: Group[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.cards && Array.isArray(data.cards)) {
      return { cards: data.cards, groups: data.groups || [] };
    }
    return null;
  } catch {
    return null;
  }
}
