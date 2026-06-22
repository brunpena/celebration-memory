import { createClient } from '@/lib/supabase/server'
import {
  CalendarDays,
  Image,
  Video,
  HardDrive,
  Users,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react'

async function getMetrics() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  const [
    { count: activeEvents },
    { count: photosToday },
    { count: videosToday },
    { count: totalFiles },
    { count: totalGuests },
    { data: upcomingEvents },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('file_type', 'photo').gte('created_at', todayIso),
    supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('file_type', 'video').gte('created_at', todayIso),
    supabase.from('gallery_files').select('*', { count: 'exact', head: true }),
    supabase.from('guests').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('id,name,date,slug').eq('status', 'ativo').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  return {
    activeEvents: activeEvents ?? 0,
    photosToday: photosToday ?? 0,
    videosToday: videosToday ?? 0,
    totalFiles: totalFiles ?? 0,
    totalGuests: totalGuests ?? 0,
    upcomingEvents: upcomingEvents ?? [],
    recentActivity: recentActivity ?? [],
  }
}

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  sub?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const metrics = await getMetrics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 capitalize">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Eventos ativos" value={metrics.activeEvents} icon={CalendarDays} />
        <MetricCard label="Fotos hoje" value={metrics.photosToday} icon={Image} sub="enviadas pelos convidados" />
        <MetricCard label="Vídeos hoje" value={metrics.videosToday} icon={Video} sub="enviados pelos convidados" />
        <MetricCard label="Total de arquivos" value={metrics.totalFiles} icon={HardDrive} />
        <MetricCard label="Convidados únicos" value={metrics.totalGuests} icon={Users} />
        <MetricCard label="Eventos próximos" value={metrics.upcomingEvents.length} icon={Clock} sub="nos próximos dias" />
        <MetricCard
          label="Atividades hoje"
          value={metrics.recentActivity.filter(a =>
            new Date(a.created_at).toDateString() === new Date().toDateString()
          ).length}
          icon={Activity}
        />
        <MetricCard label="Taxa de crescimento" value="—" icon={TrendingUp} sub="em breve" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Eventos próximos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Eventos próximos</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {metrics.upcomingEvents.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                Nenhum evento próximo
              </div>
            ) : (
              metrics.upcomingEvents.map((event: { id: string; name: string; date: string | null; slug: string }) => (
                <div key={event.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {event.date
                        ? new Date(event.date).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                    </p>
                  </div>
                  <span className="text-xs bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 px-2.5 py-1 rounded-full font-medium">
                    ativo
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atividades recentes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Atividades recentes</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {metrics.recentActivity.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                Nenhuma atividade registrada
              </div>
            ) : (
              metrics.recentActivity.map((log: { id: string; action: string; details: Record<string, unknown> | null; created_at: string }) => (
                <div key={log.id} className="px-6 py-3.5 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.action}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
