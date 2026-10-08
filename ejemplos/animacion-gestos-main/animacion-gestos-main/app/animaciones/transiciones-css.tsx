import {Button, StyleSheet, View} from "react-native";
import {materialColors} from "@/utils/colors";
import Animated from "react-native-reanimated";
import {useReducer} from "react";

export default function TransicionesCss() {
  const [isToggled, toggle] = useReducer((s) => !s, false);

  return (
      <View style={styles.container}>
        <Animated.View
            style={[
              styles.box,
              {
                width: isToggled ? 240 : 120,
                transitionProperty: ['width', 'backgroundColor'],
                backgroundColor: isToggled ? materialColors.schemes.light.primary : materialColors.schemes.light.secondary,
                transitionDuration: '500ms',
              }
            ]}
        />
        <Animated.View
            style={[
              styles.box,
              {
                transform: [{translateX: isToggled ? 150 : -150}],
                transitionProperty: 'transform',
                transitionDuration: isToggled ? '300ms' : '1.5s',
              },
            ]}
        />
        <Button onPress={toggle} title="Animar!"/>
      </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surfaceContainer,
    alignItems: 'center',
  },
  box: {
    height: 120,
    width: 120,
    marginVertical: 64,
    backgroundColor: materialColors.schemes.light.primary,
  },
})