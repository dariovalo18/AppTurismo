import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

export type StatusTone = 'read' | 'incident' | 'pending'

export type StatusBadgeProps = {
  label: string
  tone: StatusTone
}

const toneColor: Record<StatusTone, string> = {
  read: colors.accent,
  incident: colors.accentMuted,
  pending: colors.muted,
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: toneColor[tone] }]}>
      <Text style={[styles.label, { color: toneColor[tone] }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
  },
})
