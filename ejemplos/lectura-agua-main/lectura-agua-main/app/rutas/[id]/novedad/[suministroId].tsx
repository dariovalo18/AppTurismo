import { StyleSheet, Text, View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'

import { colors } from '@/theme/colors'

export default function IncidentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Novedad</Text>
      <Link href={{ pathname: '/rutas/[id]', params: { id } }} style={styles.link}>
        Guardar novedad y siguiente
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
