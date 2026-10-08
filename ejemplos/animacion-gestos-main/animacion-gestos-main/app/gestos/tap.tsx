import {Button, StyleSheet, View} from "react-native";
import {materialColors} from "@/utils/colors";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import {useState} from "react";
import Animated, {useSharedValue} from "react-native-reanimated";


const COLORS = [materialColors.schemes.light.primary, materialColors.schemes.light.secondary, materialColors.schemes.light.tertiary]

export default function Tap() {
  const colorIndex = useSharedValue(0)
  const backgroundColor = useSharedValue(COLORS[0]);
  const width = useSharedValue(100);


  const [numberOfTaps, setNumberOfTaps] = useState(1)

  const tap = Gesture.Tap().numberOfTaps(numberOfTaps)
      .onEnd(() => {
        colorIndex.value = colorIndex.value === COLORS.length - 1 ? 0 : colorIndex.value + 1
        backgroundColor.value = COLORS[colorIndex.value]
        console.log('Tap')
      })

  /*const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
        colorIndex.value,
        [0, ...COLORS.map((_, i) => i + 1), COLORS.length + 1],
        [COLORS[COLORS.length - 1], ...COLORS, COLORS[0]]
    ),
  }));*/

  return (
      <GestureHandlerRootView style={styles.container}>

        <Button
            onPress={() => setNumberOfTaps(numberOfTaps === 1 ? 2 : 1)}
            title={`Cambiar a ${numberOfTaps === 1 ? "2 toques" : "1 toque"}`}/>

        <GestureDetector gesture={tap}>
          <Animated.View style={{
            ...styles.box,
            width,
            backgroundColor
          }}></Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    height: 100,
    borderRadius: 20,
    cursor: 'pointer',
    backgroundColor: COLORS[0]
  },
})