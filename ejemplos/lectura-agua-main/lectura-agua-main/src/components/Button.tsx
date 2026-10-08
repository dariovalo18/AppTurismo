import { Pressable, StyleSheet, Text } from 'react-native'

import { colors } from '@/theme/colors'

export type ButtonProps = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  const primary = variant === 'primary'

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.base, primary ? styles.primary : styles.secondary]}
    >
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 18,
  },
  primaryLabel: {
    color: colors.onAccent,
  },
  secondaryLabel: {
    color: colors.text,
  },
})
