import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = {
  date: string
  score: number
}

type StatsChartProps = {
  data: DataPoint[]
}

export function StatsChart({ data }: StatsChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--mantine-color-blue-6)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
