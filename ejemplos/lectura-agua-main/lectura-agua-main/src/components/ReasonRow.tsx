import { Pressable, StyleSheet, Text } from 'react-native'

import { colors } from '@/theme/colors'

export type ReasonRowProps = {
  label: string
  selected: boolean
  onPress: () => void
}

export function ReasonRow({ label, selected, onPress }: ReasonRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, selected ? styles.selected : styles.idle]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  idle: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.text,
    fontSize: 18,
  },
})
