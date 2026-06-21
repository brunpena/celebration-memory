'use client'

import Link from 'next/link'

interface Props {
  activeTab: string
  counts: Record<string, number>
  eventId: string
}

const tabs = [
  { key: 'todos', label: 'Todos' },
  { key: 'fotos', label: 'Fotos' },
  { key: 'videos', label: 'Vídeos' },
  { key: 'favoritos', label: 'Favoritos' },
  { key: 'pendentes', label: 'Pendentes' },
]

export default function GalleryTabs({ activeTab, counts, eventId }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit max-w-full overflow-x-auto">
      {tabs.map(({ key, label }) => (
        <Link
          key={key}
          href={`/admin/eventos/${eventId}/galeria?tab=${key}`}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
            activeTab === key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === key ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-500'
          }`}>
            {counts[key] ?? 0}
          </span>
        </Link>
      ))}
    </div>
  )
}
