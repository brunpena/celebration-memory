import type { EventPageDesign, PageTextBlock, TextAnchor, TextBlockSize } from './types'

export const ANCHOR_GRID: TextAnchor[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'middle-center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
]

export const ANCHOR_LABELS: Record<TextAnchor, string> = {
  'top-left': 'Topo esquerda',
  'top-center': 'Topo centro',
  'top-right': 'Topo direita',
  'middle-left': 'Meio esquerda',
  'middle-center': 'Meio centro',
  'middle-right': 'Meio direita',
  'bottom-left': 'Base esquerda',
  'bottom-center': 'Base centro',
  'bottom-right': 'Base direita',
}

export const SIZE_LABELS: Record<TextBlockSize, string> = {
  sm: 'Pequeno',
  md: 'Médio',
  lg: 'Grande',
  xl: 'Extra grande',
}

export function normalizePageDesign(raw: Partial<EventPageDesign> | null | undefined): EventPageDesign {
  return {
    layout: raw?.layout === 'background' ? 'background' : 'header',
    backgroundImageUrl: raw?.backgroundImageUrl ?? null,
    headerImageUrl: raw?.headerImageUrl ?? null,
    textBlocks: Array.isArray(raw?.textBlocks) ? raw.textBlocks : [],
  }
}

export function createTextBlock(area: PageTextBlock['area']): PageTextBlock {
  return {
    id: Math.random().toString(36).slice(2),
    content: 'Novo texto',
    area,
    anchor: 'middle-center',
    size: 'md',
    color: '#ffffff',
  }
}
