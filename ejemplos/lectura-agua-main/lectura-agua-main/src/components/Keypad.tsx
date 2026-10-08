import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export type KeypadProps = {
  onDigit: (digit: string) => void
  onDelete: () => void
}

export function Keypad({ onDigit, onDelete }: KeypadProps) {
  return (
    <View style={styles.grid}>
      {digits.map((digit) => (
        <Pressable
          accessibilityRole="button"
          key={digit}
          onPress={() => onDigit(digit)}
          style={styles.key}
        >
          <Text style={styles.digit}>{digit}</Text>
        </Pressable>
      ))}
      <View style={styles.spacer} />
      <Pressable accessibilityRole="button" onPress={() => onDigit('0')} style={styles.key}>
        <Text style={styles.digit}>0</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onDelete} style={styles.key}>
        <Text style={styles.delete}>Borrar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  key: {
    width: '31%',
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: '31%',
  },
  digit: {
    color: colors.text,
    fontSize: 24,
  },
  delete: {
    color: colors.accentMuted,
    fontSize: 16,
  },
})
