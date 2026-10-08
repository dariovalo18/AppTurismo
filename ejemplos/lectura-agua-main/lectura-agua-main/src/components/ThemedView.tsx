import { View } from 'react-native'

import { useTheme } from '@/hooks/use-theme'

import type { ViewProps } from 'react-native'

export type ThemedViewProps = ViewProps

/**
 * Paints its background with the current palette.
 *
 * `children` is whatever you nest between the opening and closing tags.
 * This component does not build that content. React passes it in, and the
 * component places it inside the native View. A parent can wrap any subtree:
 *
 * <ThemedView>
 *   <ThemedText>Hola</ThemedText>
 * </ThemedView>
 */
export function ThemedView({ children, style, ...rest }: ThemedViewProps) {
  const { paleta } = useTheme()

  return (
    <View style={[{ backgroundColor: paleta.background }, style]} {...rest}>
      {children}
    </View>
  )
}
