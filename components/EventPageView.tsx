import Link from 'next/link'
import { Calendar, MapPin, Camera, Gift } from 'lucide-react'
import type { EventPageDesign, PageTextBlock, TextAnchor, TextBlockSize } from '@/lib/types'

const ANCHOR_CLASSES: Record<TextAnchor, string> = {
  'top-left': 'top-4 left-4 text-left',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 text-center',
  'top-right': 'top-4 right-4 text-right',
  'middle-left': 'top-1/2 left-4 -translate-y-1/2 text-left',
  'middle-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center',
  'middle-right': 'top-1/2 right-4 -translate-y-1/2 text-right',
  'bottom-left': 'bottom-4 left-4 text-left',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 text-center',
  'bottom-right': 'bottom-4 right-4 text-right',
}

const BODY_ALIGN_CLASSES: Record<TextAnchor, string> = {
  'top-left': 'text-left', 'middle-left': 'text-left', 'bottom-left': 'text-left',
  'top-center': 'text-center', 'middle-center': 'text-center', 'bottom-center': 'text-center',
  'top-right': 'text-right', 'middle-right': 'text-right', 'bottom-right': 'text-right',
}

const SIZE_CLASSES: Record<TextBlockSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
}

function OverlayText({ block }: { block: PageTextBlock }) {
  return (
    <p
      className={`absolute max-w-[85%] sm:max-w-md font-semibold drop-shadow-lg whitespace-pre-line ${ANCHOR_CLASSES[block.anchor]} ${SIZE_CLASSES[block.size]}`}
      style={{ color: block.color }}
    >
      {block.content}
    </p>
  )
}

interface Props {
  name: string
  slug: string
  description: string | null
  date: string | null
  location: string | null
  design: EventPageDesign
  photoCount: number
  hasGiftList: boolean
  interactive?: boolean
}

export default function EventPageView({
  name,
  slug,
  description,
  date,
  location,
  design,
  photoCount,
  hasGiftList,
  interactive = true,
}: Props) {
  const overlayBlocks = design.textBlocks.filter((b) => design.layout === 'background' || b.area === 'overlay')
  const bodyBlocks = design.layout === 'header' ? design.textBlocks.filter((b) => b.area === 'body') : []

  const formattedDate = date
    ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const actionButtons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <Link
        href={`/e/${slug}/upload`}
        className="flex flex-col items-center gap-3 p-6 sm:p-8 bg-gradient-to-br from-violet-50 to-purple-50 active:from-violet-100 active:to-purple-100 sm:hover:from-violet-100 sm:hover:to-purple-100 border-2 border-violet-200 sm:hover:border-violet-400 rounded-2xl transition group"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-600 sm:group-hover:bg-violet-500 flex items-center justify-center transition">
          <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-base sm:text-lg">Enviar Fotos</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {photoCount ? `${photoCount} foto${photoCount !== 1 ? 's' : ''} enviada${photoCount !== 1 ? 's' : ''}` : 'Seja o primeiro a enviar!'}
          </p>
        </div>
      </Link>

      {hasGiftList && (
        <Link
          href={`/e/${slug}/presentes`}
          className="flex flex-col items-center gap-3 p-6 sm:p-8 bg-gradient-to-br from-pink-50 to-rose-50 active:from-pink-100 active:to-rose-100 sm:hover:from-pink-100 sm:hover:to-rose-100 border-2 border-pink-200 sm:hover:border-pink-400 rounded-2xl transition group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-500 sm:group-hover:bg-pink-400 flex items-center justify-center transition">
            <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-base sm:text-lg">Lista de Presentes</p>
            <p className="text-sm text-gray-500 mt-0.5">Presenteie com carinho</p>
          </div>
        </Link>
      )}
    </div>
  )

  const dateLocation = (formattedDate || location) && (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
      {formattedDate && (
        <span className="flex items-center justify-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {formattedDate}
        </span>
      )}
      {location && (
        <span className="flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {location}
        </span>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen bg-white ${interactive ? '' : 'pointer-events-none select-none'}`}>
      {design.layout === 'background' ? (
        <div
          className="relative min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 bg-cover bg-center"
          style={design.backgroundImageUrl ? { backgroundImage: `url(${design.backgroundImageUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative flex flex-col items-center justify-center text-center px-5 py-16 sm:py-20 min-h-screen gap-5">
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight drop-shadow-lg leading-tight">{name}</h1>
              <div className="mt-3 text-white/80">{dateLocation}</div>
            </div>

            {description && (
              <p className="text-white/85 text-center leading-relaxed text-sm sm:text-base max-w-md">{description}</p>
            )}

            <div className="w-full max-w-md">{actionButtons}</div>

            <p className="text-center text-xs text-white/50 pt-2">Powered by Celebration Memory</p>
          </div>

          {overlayBlocks.map((block) => <OverlayText key={block.id} block={block} />)}
        </div>
      ) : (
        <>
          <div
            className="relative h-[25vh] max-h-[25vh] min-h-[160px] bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 bg-cover bg-center overflow-hidden"
            style={design.headerImageUrl ? { backgroundImage: `url(${design.headerImageUrl})` } : undefined}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
              <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight drop-shadow-lg leading-tight">{name}</h1>
            </div>
            {overlayBlocks.map((block) => <OverlayText key={block.id} block={block} />)}
          </div>

          <div className="max-w-md sm:max-w-2xl mx-auto px-5 py-8 sm:py-10 space-y-7 sm:space-y-8">
            {dateLocation && <div className="text-gray-500">{dateLocation}</div>}

            {description && (
              <p className="text-gray-600 text-center leading-relaxed text-sm sm:text-base">{description}</p>
            )}

            {bodyBlocks.map((block) => (
              <p
                key={block.id}
                className={`${BODY_ALIGN_CLASSES[block.anchor]} ${SIZE_CLASSES[block.size]} whitespace-pre-line`}
                style={{ color: block.color }}
              >
                {block.content}
              </p>
            ))}

            {actionButtons}

            <p className="text-center text-xs text-gray-300 pt-2">Powered by Celebration Memory</p>
          </div>
        </>
      )}
    </div>
  )
}
