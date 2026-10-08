import { StyleSheet, Text, View } from 'react-native'
import { Link, useGlobalSearchParams } from 'expo-router'

import { colors } from '@/theme/colors'

export default function RouteSummaryScreen() {
  // The id is on the parent segment. A tab does not receive it from useLocalSearchParams.
  const { id } = useGlobalSearchParams<{ id: string }>()

  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Resumen</Text>
      {/* P-08, P-09: whether the route can close stays open. This link does not decide it. */}
      <Link
        href={{ pathname: '/rutas/[id]/cerrada', params: { id } }}
        style={styles.link}
      >
        Cerrar ruta
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
