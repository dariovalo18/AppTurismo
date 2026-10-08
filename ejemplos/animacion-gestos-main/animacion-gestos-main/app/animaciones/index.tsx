import {View, StyleSheet, FlatList} from "react-native";
import {materialColors} from "@/utils/colors";
import LinkListItem from "@/components/link-list-item";


const links = [
  {
    url: '/animaciones/transiciones-css',
    label: 'Ir a Transiciones CSS'
  },{
    url: '/animaciones/animaciones-css',
    label: 'Ir a Animaciones CSS'
  },{
    url: '/animaciones/animaciones-funciones',
    label: 'Ir a Funciones para animación'
  },
]


export default function Gestos() {
  return (
      <View style={styles.container}>
        <FlatList
            data={links}
            renderItem={({item}) => (
                <LinkListItem url={item.url} label={item.label}/>
            )}
        >
        </FlatList>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surfaceContainer,
  }
})