export interface Card {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  groupId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CanvasState {
  panX: number;
  panY: number;
  zoom: number;
}

export type Tool = 'select' | 'pan';
