import {RelativePathString, useRouter} from "expo-router";
import {StyleSheet, View, Text, Pressable} from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {materialColors} from "@/utils/colors";

interface IProps {
  url: string;
  label: string;
}

export default function LinkListItem(props: IProps) {
  const {url, label} = props;
  const router = useRouter();


  const handleNavigation = () => {
    router.push(url as RelativePathString);
  }

  return (
      <Pressable onPress={handleNavigation}>
        <View style={styles.container}>
          <Text>{label}</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="black"/>
        </View>
      </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: materialColors.schemes.light.surface,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.2,
    borderBottomColor: materialColors.palettes.neutral[50],
  }
})