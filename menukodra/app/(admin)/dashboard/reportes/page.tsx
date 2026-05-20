import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReporteData } from './_actions/reportes'
import { ReportesView } from './_components/reportes-view'

export const metadata = { title: 'Reportes — MenuKodra' }

function dateRange(days: number) {
  const today = new Date()
  const to = today.toISOString().slice(0, 10)
  const from = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)
  return { from, to }
}

export default async function ReportesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { from, to } = dateRange(30)
  const { summary, daily, topItems } = await getReporteData(from, to)

  return (
    <ReportesView
      initialSummary={summary}
      initialDaily={daily}
      initialTopItems={topItems}
    />
  )
}
