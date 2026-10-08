import {Button, Dimensions, StyleSheet, View} from "react-native";
import {materialColors} from "@/utils/colors";
import Animated, {CSSAnimationKeyframes} from "react-native-reanimated";
import {useReducer} from "react";


const {width} = Dimensions.get('screen');
const ANCHO = 100;
const slide: CSSAnimationKeyframes = {
  '0%': {
    transform: [{translateX: -(width / 2) + (ANCHO / 2)}],
    backgroundColor: materialColors.schemes.light.primary,
  },
  /*'50%': {
    backgroundColor: materialColors.schemes.light.error,
  },
  '75%': {
    backgroundColor: materialColors.schemes.light.tertiary,
  },*/
  '100%': {
    transform: [{translateX: width / 2 - (ANCHO / 2)}],
    backgroundColor: materialColors.schemes.light.tertiary,
  },
};

/*
  ES LO MISMO QUE DECIR
const slide: CSSAnimationKeyframes = {
  'from': {
    transform: [{translateX: -(width / 2) + (ANCHO / 2)}],
  },
  'to': {
    transform: [{translateX: width / 2 - (ANCHO / 2)}],
  },
};*/


export default function AnimacionesCss() {
  // const [isToggled, toggle] = useReducer((s) => !s, false);
  const [estaPausado, pausar] = useReducer((s) => !s, false);

  return (
      <View style={styles.container}>
        <Animated.View
            style={[
              styles.box,
              {
                animationName: slide,
                animationDuration: '2s',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate', //Por cada iteracion intercala entre ir para adelante o atras
                animationTimingFunction: 'ease-in-out',
                animationPlayState: estaPausado ? 'paused' : 'running',
              },
            ]}
        />
        <Button onPress={pausar} title={estaPausado ? 'Play' : 'Pausar'}/>
        {/*<Button onPress={toggle} title="Animar!"/>*/}
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
    height: 100,
    width: ANCHO,
    marginVertical: 64,
    backgroundColor: materialColors.schemes.light.primary,
  },
})