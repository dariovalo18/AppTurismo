import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

import { colors } from '@/theme/colors'
import { useContext } from 'react';
import { ThemeContext } from '@/providers/ThemeProvider';

export default function TodaysRoutesScreen() {


  const { tema } = useContext(ThemeContext);
  return (
    <View style={styles.screen}>
      {/* Placeholder. Compose the view in class from src/components. */}
      <Text style={styles.title}>Rutas de hoy</Text>
      <Link href="/rutas/07" style={styles.link}>
        Ruta 07 · Barrio Brasil
      </Link>
      <Link href="/rutas/12" style={styles.link}>
        Ruta 12 · Quintas Norte
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
