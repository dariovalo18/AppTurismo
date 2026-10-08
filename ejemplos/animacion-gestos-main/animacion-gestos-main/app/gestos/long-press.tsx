import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {Easing, StyleSheet} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue, withSpring,
  withTiming,
} from 'react-native-reanimated';
import {materialColors} from "@/utils/colors";

const COLORS = [materialColors.schemes.light.primary, materialColors.schemes.light.secondary, materialColors.schemes.light.tertiary]


export default function LongPress() {
  const colorIndex = useSharedValue(0)
  const backgroundColor = useSharedValue(COLORS[0]);
  const width = useSharedValue(100);
  const height = useSharedValue(100);

  const longPress = Gesture.LongPress()
      .onBegin(() => {
        console.log('Long Press')
        /*scale.value = withTiming(1.2, {
          duration: 500,
          easing: Easing.bezier(0.31, 0.04, 0.03, 1.04),
        });*/
      })
      .onFinalize(() => {
        console.log('Long Press FINISHED')
        colorIndex.value = colorIndex.value === COLORS.length - 1 ? 0 : colorIndex.value + 1
        backgroundColor.value = COLORS[colorIndex.value]
        width.value = withSpring(width.value + 100)
        height.value = withSpring(height.value + 100)

      });

  return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={longPress}>
          <Animated.View style={{
            ...styles.box,
            width,
            height,
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
    width: 100,
    height: 100,
    borderRadius: 20,
    cursor: 'pointer',
    backgroundColor: materialColors.schemes.light.primary,
  },
})