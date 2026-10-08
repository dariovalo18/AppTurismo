import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useTheme } from '@/hooks/use-theme'

import type { ColorSchemePreference } from '@/providers/ThemeProvider'

const appearanceOptions: { label: string; value: ColorSchemePreference | null }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Como el teléfono', value: null },
]

/**
 * Not mounted by a route yet. Render it inside ThemeProvider.
 */
export function ProfileView() {
  const { preference, setPreference, colors } = useTheme()

  return (
    <ThemedView style={styles.screen}>
      <ThemedText style={styles.title}>Perfil</ThemedText>
      <ThemedText style={styles.section}>Apariencia</ThemedText>
      {appearanceOptions.map((option) => {
        const selected = preference === option.value

        return (
          <Pressable
            key={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setPreference(option.value)}
            style={[
              styles.row,
              {
                borderColor: selected ? colors.accent : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <ThemedText>{option.label}</ThemedText>
          </Pressable>
        )
      })}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
  },
  section: {
    fontSize: 16,
    marginTop: 8,
  },
  row: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
})
