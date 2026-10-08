import { useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'

import { colors } from '@/theme/colors'

export default function OpenRouteLayout() {
  const { id } = useLocalSearchParams<{ id: string }>()
  
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Native stack header: the tab header is not a system bar, so it cannot draw the iOS back button. */}
      <Stack.Screen name="(modo)" options={{ title: `Ruta ${id}` }} />
      <Stack.Screen name="lectura/[suministroId]" options={{ title: 'Lectura' }} />
      <Stack.Screen name="novedad/[suministroId]" options={{ title: 'Novedad' }} />
      <Stack.Screen
        name="aviso"
        options={{ presentation: 'modal', title: 'Revisá este número' }}
      />
      <Stack.Screen
        name="video"
        options={{ presentation: 'modal', title: 'Cómo se lee' }}
      />
      <Stack.Screen name="cerrada" options={{ title: 'Ruta cerrada' }} />
    </Stack>
  )
}
