import { create } from 'zustand';
import type { Card, Group, CanvasState, Tool } from '../types';
import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT } from '../utils/constants';
import { saveToStorage, loadFromStorage } from '../utils/exportImport';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface AppStore {
  // Data
  cards: Card[];
  groups: Group[];
  canvas: CanvasState;

  // UI state
  activeCardId: string | null;
  searchQuery: string;
  matchingCardIds: string[] | null; // null = no active search, [] = no matches
  selectedTool: Tool;
  sidebarOpen: boolean;

  // Card actions
  addCard: (centerX?: number, centerY?: number) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, x: number, y: number) => void;
  resizeCard: (id: string, w: number, h: number) => void;

  // Group actions
  addGroup: (label: string, x: number, y: number) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  // Tag actions
  addTag: (cardId: string, tag: string) => void;
  removeTag: (cardId: string, tag: string) => void;

  // Canvas actions
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;

  // UI actions
  setActiveCard: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setMatchingCardIds: (ids: string[] | null) => void;
  setSelectedTool: (tool: Tool) => void;
  toggleSidebar: () => void;

  // Persistence
  importCards: (cards: Card[], groups: Group[]) => void;

  // Internal
  _persist: () => void;
}

const stored = loadFromStorage();

export const useStore = create<AppStore>((set, get) => ({
  // Initial data
  cards: stored?.cards ?? [],
  groups: stored?.groups ?? [],
  canvas: { panX: 0, panY: 0, zoom: 1 },

  // UI state
  activeCardId: null,
  searchQuery: '',
  matchingCardIds: null,
  selectedTool: 'select',
  sidebarOpen: true,

  // Internal persist helper
  _persist: () => {
    const { cards, groups } = get();
    saveToStorage(cards, groups);
  },

  // Card actions
  addCard: (centerX?: number, centerY?: number) => {
    const { canvas } = get();
    const x = centerX ?? (-canvas.panX + window.innerWidth / 2) / canvas.zoom - DEFAULT_CARD_WIDTH / 2;
    const y = centerY ?? (-canvas.panY + window.innerHeight / 2) / canvas.zoom - DEFAULT_CARD_HEIGHT / 2;

    const newCard: Card = {
      id: generateId(),
      title: 'Untitled',
      code: '',
      language: 'javascript',
      tags: [],
      x,
      y,
      width: DEFAULT_CARD_WIDTH,
      height: DEFAULT_CARD_HEIGHT,
      groupId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({ cards: [...state.cards, newCard], activeCardId: newCard.id }));
    get()._persist();
  },

  updateCard: (id, updates) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      ),
    }));
    get()._persist();
  },

  deleteCard: (id) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      activeCardId: state.activeCardId === id ? null : state.activeCardId,
    }));
    get()._persist();
  },

  moveCard: (id, x, y) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, x, y, updatedAt: Date.now() } : c
      ),
    }));
    get()._persist();
  },

  resizeCard: (id, w, h) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, width: w, height: h, updatedAt: Date.now() } : c
      ),
    }));
    get()._persist();
  },

  // Group actions
  addGroup: (label, x, y) => {
    const newGroup: Group = {
      id: generateId(),
      label,
      x,
      y,
      width: 600,
      height: 400,
      color: '#4ade80',
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
    get()._persist();
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    }));
    get()._persist();
  },

  deleteGroup: (id) => {
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
    get()._persist();
  },

  // Tag actions
  addTag: (cardId, tag) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId && !c.tags.includes(tag)
          ? { ...c, tags: [...c.tags, tag], updatedAt: Date.now() }
          : c
      ),
    }));
    get()._persist();
  },

  removeTag: (cardId, tag) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? { ...c, tags: c.tags.filter((t) => t !== tag), updatedAt: Date.now() }
          : c
      ),
    }));
    get()._persist();
  },

  // Canvas actions
  setPan: (panX, panY) => {
    set((state) => ({ canvas: { ...state.canvas, panX, panY } }));
  },

  setZoom: (zoom) => {
    set((state) => ({ canvas: { ...state.canvas, zoom } }));
  },

  // UI actions
  setActiveCard: (id) => set({ activeCardId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMatchingCardIds: (ids) => set({ matchingCardIds: ids }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Persistence
  importCards: (cards, groups) => {
    set({ cards, groups });
    get()._persist();
  },
}));
