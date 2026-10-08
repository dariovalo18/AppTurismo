import { Text } from 'react-native'

import { useTheme } from '@/hooks/use-theme'

import type { TextProps } from 'react-native'

export type ThemedTextProps = TextProps

/**
 * Renders its children in the palette text color.
 *
 * A Text child can be a string ("Hola") or more text nested inside. Those
 * nested nodes are still `children`: React passes them in, and this
 * component puts them inside the native Text.
 *
 * <ThemedText>
 *   Lectura <ThemedText>anterior</ThemedText>
 * </ThemedText>
 */
export function ThemedText({ children, style, ...rest }: ThemedTextProps) {
  const { paleta } = useTheme()

  return (
    <Text style={[{ color: paleta.text }, style]} {...rest}>
      {children}
    </Text>
  )
}
