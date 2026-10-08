import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

export type SupplyRowProps = {
  ordinal: string
  address: string
  holder: string
  status?: string
}

export function SupplyRow({ ordinal, address, holder, status }: SupplyRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.ordinal}>{ordinal}</Text>
      <View style={styles.body}>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.holder}>{holder}</Text>
      </View>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ordinal: {
    color: colors.muted,
    fontSize: 16,
    minWidth: 32,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  address: {
    color: colors.text,
    fontSize: 18,
  },
  holder: {
    color: colors.muted,
    fontSize: 14,
  },
  status: {
    color: colors.accentMuted,
    fontSize: 14,
  },
})
