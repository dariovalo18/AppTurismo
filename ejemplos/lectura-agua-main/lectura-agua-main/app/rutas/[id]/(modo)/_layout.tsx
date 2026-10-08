import { Tabs } from 'expo-router'

import { colors } from '@/theme/colors'

export default function RouteModeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarStyle: { backgroundColor: colors.surface },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Lista' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="resumen" options={{ title: 'Resumen' }} />
    </Tabs>
  )
}
