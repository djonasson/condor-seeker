import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { DateFormat } from '@/storage/types'
import { formatDate } from '@/lib/date-format'

type DataPoint = {
  date: string
  score: number
}

type StatsChartProps = {
  data: DataPoint[]
  dateFormat: DateFormat
}

export function StatsChart({ data, dateFormat }: StatsChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" tickFormatter={(val: string) => formatDate(val, dateFormat)} />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip labelFormatter={(val: string) => formatDate(val, dateFormat)} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--mantine-primary-color-6)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
