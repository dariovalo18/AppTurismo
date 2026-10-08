import {Stack, useRouter} from 'expo-router';
import {Pressable, Text} from 'react-native'

export const unstable_settings = {
  initialRouteName: 'index',
};


export default function AnimacionesLayout() {

  const router = useRouter();

  const handleBack = () => {
    router.back();
  }

  return (
      <Stack screenOptions={{
        headerBackButtonDisplayMode: "minimal",
      }}>
        <Stack.Screen name="index" options={{
          title: 'Animaciones',
          headerLeft: ({label, tintColor}) => (
              <Pressable onPress={handleBack}><Text>{label ? label : 'Atras'}</Text></Pressable>
          )
        }}/>
        <Stack.Screen name="transiciones-css" options={{
          title: 'Transiciones CSS',
        }}/>
        <Stack.Screen name="animaciones-css" options={{
          title: 'Animaciones CSS',
        }}/>
        <Stack.Screen name="animaciones-funciones" options={{
          title: 'Funciones para Animar',
        }}/>
      </Stack>
  );
}
