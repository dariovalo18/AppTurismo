import {StyleSheet} from "react-native";
import {materialColors} from "@/utils/colors";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";

export default function Rotation(){


  const angle = useSharedValue(0);
  const startAngle = useSharedValue(0);

  const rotation = Gesture.Rotation()
      .onStart(() => {
        startAngle.value = angle.value;
      })
      .onUpdate((event) => {
        angle.value = startAngle.value + event.rotation;
      });

  const boxAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}rad` }],
  }));

  return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={rotation}>
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
    width: 300,
    height: 300,
    borderRadius: 20,
    cursor: 'pointer',
    backgroundColor:materialColors.schemes.light.primary,
  },
})