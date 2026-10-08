import { StyleSheet, Text, View } from 'react-native'
import { Link, useGlobalSearchParams } from 'expo-router'

import { colors } from '@/theme/colors'

export default function RouteMapScreen() {
  // The id is on the parent segment. A tab does not receive it from useLocalSearchParams.
  const { id } = useGlobalSearchParams<{ id: string }>()

  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Mapa</Text>
      <Link
        href={{
          pathname: '/rutas/[id]/lectura/[suministroId]',
          params: { id, suministroId: '89' },
        }}
        style={styles.link}
      >
        Abrir suministro
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
