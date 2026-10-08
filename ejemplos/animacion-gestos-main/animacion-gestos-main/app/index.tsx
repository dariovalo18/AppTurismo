import {View, StyleSheet, FlatList} from "react-native";
import {materialColors} from "@/utils/colors";
import LinkListItem from "@/components/link-list-item";


const links = [
  {
    url: './gestos',
    label: 'Ir a Gestos'
  },{
    url: './animaciones',
    label: 'Ir a Animaciones'
  }
]


export default function Home() {
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