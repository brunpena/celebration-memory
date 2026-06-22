import { BarChart3 } from 'lucide-react'

export default function RelatoriosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Relatórios</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Métricas e análises dos seus eventos</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Em breve</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
          Relatórios de crescimento, engajamento de convidados e uso de armazenamento estarão disponíveis aqui em uma próxima atualização.
        </p>
      </div>
    </div>
  )
}
