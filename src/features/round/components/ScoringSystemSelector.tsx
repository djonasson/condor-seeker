import { useTranslation } from 'react-i18next'
import { SegmentPicker } from '@/components/SegmentPicker'

type ScoringSystemSelectorProps = {
  value: string
  onChange: (value: string) => void
}

export function ScoringSystemSelector({ value, onChange }: ScoringSystemSelectorProps) {
  const { t } = useTranslation()

  return (
    <SegmentPicker
      value={value}
      onChange={onChange}
      data={[
        { label: t('round:strokePlay'), value: 'stroke' },
        { label: t('round:stableford'), value: 'stableford' },
      ]}
      fullWidth
    />
  )
}
