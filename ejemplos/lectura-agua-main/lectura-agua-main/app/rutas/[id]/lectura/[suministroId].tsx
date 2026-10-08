import { StyleSheet, Text, View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'

import { colors } from '@/theme/colors'

export default function ReadingScreen() {
  const { id, suministroId } = useLocalSearchParams<{ id: string; suministroId: string }>()

  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Lectura</Text>
      <Link
        href={{
          pathname: '/rutas/[id]/novedad/[suministroId]',
          params: { id, suministroId },
        }}
        style={styles.link}
      >
        No se pudo leer
      </Link>
      <Link href={{ pathname: '/rutas/[id]/video', params: { id } }} style={styles.link}>
        Cómo se lee
      </Link>
      <Link href={{ pathname: '/rutas/[id]/aviso', params: { id } }} style={styles.link}>
        Revisá este número
      </Link>
      <Link href={{ pathname: '/rutas/[id]', params: { id } }} style={styles.link}>
        Guardar y siguiente
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
