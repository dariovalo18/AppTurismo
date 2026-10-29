import { Tabs } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';

import { GestorAgenda } from '@/componentes/GestorAgenda';
import { VigilanteProximidad } from '@/componentes/VigilanteProximidad';
import { useTema } from '@/proveedores/ProveedorTema';

type Icono = React.ComponentProps<typeof Ionicons>['name'];

// Devuelve la función que dibuja el ícono de una pestaña.
const icono = (nombre: Icono) =>
  function IconoTab({ color, size }: { color: string; size: number }) {
    return <Ionicons name={nombre} size={size} color={color} />;
  };

// ESTÉTICA: barra de pestañas de abajo, con colores de la paleta e iconos Ionicons.
// Docs Tabs de Expo Router: https://docs.expo.dev/router/advanced/tabs/
// Menú de navegación de abajo. Cada Tabs.Screen corresponde a un archivo de esta carpeta.
export default function LayoutTabs() {
  const paleta = useTema();

  return (
    <>
      {/* Aviso de proximidad: no se ve, solo escucha la ubicación mientras la app está abierta. */}
      <VigilanteProximidad />
      {/* Agenda: registra el teléfono para push, sincroniza recordatorios y abre el evento al tocar el aviso. */}
      <GestorAgenda />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: paleta.acento,
          tabBarInactiveTintColor: paleta.textoSuave,
          tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
          tabBarStyle: { backgroundColor: paleta.superficie, borderTopColor: paleta.borde, minHeight: 64 },
        }}
      >
        <Tabs.Screen name="inicio" options={{ title: 'Inicio', tabBarIcon: icono('home-outline') }} />
        <Tabs.Screen name="mapa" options={{ title: 'Mapa', tabBarIcon: icono('map-outline') }} />
        <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: icono('calendar-outline') }} />
        <Tabs.Screen name="recorrido" options={{ title: 'Recorrido', tabBarIcon: icono('footsteps-outline') }} />
        <Tabs.Screen name="yo" options={{ title: 'Yo', tabBarIcon: icono('person-outline') }} />

        {/* Secciones que se abren desde Inicio: no tienen botón propio pero conservan el menú de abajo. */}
        <Tabs.Screen name="lugares" options={{ href: null }} />
        <Tabs.Screen name="favoritos" options={{ href: null }} />
        <Tabs.Screen name="audioguias" options={{ href: null }} />
      </Tabs>
    </>
  );
}