export type EventStatus = 'rascunho' | 'ativo' | 'arquivado' | 'encerrado'
export type FileType = 'photo' | 'video'
export type GiftStatus = 'disponivel' | 'reservado' | 'comprado'
export type UserRole = 'proprietario' | 'administrador' | 'editor' | 'visualizador'
export type PlanName = 'basico' | 'pro' | 'enterprise'

export interface Account {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  domain: string | null
  plan_id: string | null
  created_at: string
}

export interface Plan {
  id: string
  name: PlanName
  max_events: number | null
  max_storage_gb: number | null
  max_users: number | null
  price_monthly: number
}

export interface AppUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: UserRole
  account_id: string
  created_at: string
}

export type PageLayout = 'background' | 'header'

export type TextAnchor =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type TextBlockArea = 'overlay' | 'body'
export type TextBlockSize = 'sm' | 'md' | 'lg' | 'xl'

export interface PageTextBlock {
  id: string
  content: string
  area: TextBlockArea
  anchor: TextAnchor
  size: TextBlockSize
  color: string
}

export interface EventPageDesign {
  layout: PageLayout
  backgroundImageUrl: string | null
  headerImageUrl: string | null
  textBlocks: PageTextBlock[]
}

export interface Event {
  id: string
  account_id: string
  name: string
  slug: string
  description: string | null
  date: string | null
  location: string | null
  cover_url: string | null
  status: EventStatus
  page_design: Partial<EventPageDesign> | null
  created_at: string
  _count?: {
    gallery_files: number
    guests: number
  }
}

export interface GalleryFile {
  id: string
  event_id: string
  guest_id: string | null
  file_url: string
  thumbnail_url: string | null
  file_type: FileType
  file_size: number
  original_name: string | null
  is_approved: boolean
  is_favorite: boolean
  created_at: string
  guests?: Guest
}

export interface Guest {
  id: string
  event_id: string
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  created_at: string
}

export interface GiftList {
  id: string
  event_id: string
  name: string
  pix_key: string | null
  description: string | null
  created_at: string
}

export interface Gift {
  id: string
  gift_list_id: string
  name: string
  description: string | null
  value: number | null
  image_url: string | null
  category: string | null
  quantity: number
  status: GiftStatus
  created_at: string
}

export interface GiftOrder {
  id: string
  gift_id: string
  guest_name: string
  message: string | null
  paid: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  account_id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export interface DashboardMetrics {
  totalActiveEvents: number
  photosToday: number
  videosToday: number
  totalFiles: number
  storageUsedMb: number
  totalGuests: number
  upcomingEvents: Event[]
  recentActivity: AuditLog[]
}
