import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

export type SyncStripProps = {
  label: string
}

export function SyncStrip({ label }: SyncStripProps) {
  return (
    <View style={styles.strip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
})
