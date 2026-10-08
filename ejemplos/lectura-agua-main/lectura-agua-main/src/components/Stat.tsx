import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

export type StatProps = {
  label: string
  value: string
}

export function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  stat: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 28,
  },
})
