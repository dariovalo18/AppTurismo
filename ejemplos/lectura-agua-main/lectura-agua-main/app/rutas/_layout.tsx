import { Stack } from 'expo-router/stack'

import { colors } from '@/theme/colors'

export default function RoutesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Rutas de hoy' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
