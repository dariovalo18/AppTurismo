import {Stack, useRouter} from 'expo-router';
import {Pressable, Text} from 'react-native'

export const unstable_settings = {
  initialRouteName: 'index',
};


export default function GestosLayout() {

  const router = useRouter();

  const handleBack = () => {
    router.back();
  }

  return (
      <Stack screenOptions={{
        headerBackButtonDisplayMode: "minimal",


      }}>
        <Stack.Screen name="index" options={{
          title: 'Gestos',
          headerLeft: ({label, tintColor}) => (
              <Pressable onPress={handleBack}><Text>{label ? label : 'Atras'}</Text></Pressable>
          )
        }}/>
        <Stack.Screen name="tap" options={{
          title: 'TAP',
        }}/>
        <Stack.Screen name="long-press" options={{
          title: 'LONG PRESS',
        }}/>
        <Stack.Screen name="rotation" options={{
          title: 'ROTATION',
        }}/>
        <Stack.Screen name="pinch" options={{
          title: 'PINCH',
        }}/>
      </Stack>
  );
}
