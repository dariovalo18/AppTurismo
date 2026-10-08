import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

import { colors } from '@/theme/colors'

export default function RouteClosedScreen() {
  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Ruta cerrada</Text>
      <Link href="/" replace style={styles.link}>
        Volver a empezar
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
  },
  link: {
    color: colors.accent,
    fontSize: 18,
  },
})
