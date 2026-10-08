import {View, StyleSheet, FlatList} from "react-native";
import {materialColors} from "@/utils/colors";
import LinkListItem from "@/components/link-list-item";


const links = [
  {
    url: '/gestos/tap',
    label: 'Ir a tap'
  }, {
    url: '/gestos/long-press',
    label: 'Ir a long press'
  }, {
    url: '/gestos/rotation',
    label: 'Ir a rotation'
  }, {
    url: '/gestos/pinch',
    label: 'Ir a pinch'
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