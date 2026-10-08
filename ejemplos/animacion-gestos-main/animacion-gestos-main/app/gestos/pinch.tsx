import {Dimensions, StyleSheet, View} from "react-native";
import {materialColors} from "@/utils/colors";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";

const {width, height} = Dimensions.get('screen');

//Para definir limites
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function Pinch() {


  const scale = useSharedValue(1);
  const startScale = useSharedValue(0);

  const pinch = Gesture.Pinch()
      .onStart(() => {
        startScale.value = scale.value;
      })
      .onUpdate((event) => {
        scale.value = clamp(
            startScale.value * event.scale,
            0.5,
            Math.min(width / 100, height / 100)
        );
      })
      .runOnJS(true);

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={pinch}>
          <Animated.View style={[styles.box, boxAnimatedStyles]}></Animated.View>
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
    width: 100,
    height: 100,
    borderRadius: 20,
    cursor: 'pointer',
    backgroundColor: materialColors.schemes.light.primary,
  },
})