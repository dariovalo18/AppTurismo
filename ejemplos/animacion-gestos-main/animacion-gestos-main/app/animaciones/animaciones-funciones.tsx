import {Button, Dimensions, StyleSheet, View} from "react-native";
import {materialColors} from "@/utils/colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing, withDelay
} from "react-native-reanimated";
import {useState} from "react";


const {width} = Dimensions.get('screen');
const DURATION = 1000;
const DELAY = 500;
const ANCHO = 100;
const COLORS = [materialColors.schemes.light.primary, materialColors.schemes.light.secondary, materialColors.schemes.light.tertiary]

export default function AnimacionesFunciones() {
  const [isShown, setShown] = useState<boolean>(false);
  const offset = useSharedValue((width / 2) - (ANCHO / 2));
  const backgroundColor = useSharedValue(COLORS[0]);
  const opacity1 = useSharedValue<number>(0);
  const opacity2 = useSharedValue<number>(0);
  const opacity3 = useSharedValue<number>(0);
  // const [isToggled, toggle] = useReducer((s) => !s, false);


  const handleAnimar = () => {
    offset.value = withRepeat(
        withTiming(-offset.value, {duration: 1750, easing: Easing.bounce}),
        -1,
        true
    );
  }

  const showText = () => {
    if (isShown) {
      opacity3.value = withDelay(0, withTiming(0, {duration: DURATION}));
      opacity2.value = withDelay(DELAY, withTiming(0, {duration: DURATION}));
    } else {
      opacity1.value = withDelay(0, withTiming(1, {duration: DURATION}));
      opacity2.value = withDelay(DELAY, withTiming(1, {duration: DURATION}));
    }

    setShown(!isShown);
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateX: offset.value}],
    backgroundColor: backgroundColor.value,
  }));

  return (
      <View style={styles.container}>
        <Animated.View
            style={[
              styles.box,
              animatedStyles
            ]}
        />
        <Button onPress={handleAnimar} title="Animar!"/>
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.text, { opacity: opacity1 }]}>
           Desarrollo
          </Animated.Text>
          <Animated.Text style={[styles.text, { opacity: opacity2 }]}>
            Movil
          </Animated.Text>
        </View>
        <Button title={`${isShown ? 'Ocultar' : 'Mostrar'} texto`} onPress={showText} />
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
    borderRadius: 8,
    height: 100,
    width: ANCHO,
    marginVertical: 64,
    backgroundColor: materialColors.schemes.light.primary,
  },
  textContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 42,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 8,
    color: materialColors.schemes.light.onSurface,
  },
})