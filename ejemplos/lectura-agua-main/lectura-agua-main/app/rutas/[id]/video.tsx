import { StyleSheet, Text, View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'

import { colors } from '@/theme/colors'

export default function MeterVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Cómo se lee</Text>
      <Link
        href={{
          pathname: '/rutas/[id]/lectura/[suministroId]',
          params: { id, suministroId: '89' },
        }}
        style={styles.link}
      >
        Volver a la lectura
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
