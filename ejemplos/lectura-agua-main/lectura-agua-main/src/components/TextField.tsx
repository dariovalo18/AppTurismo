import { StyleSheet, Text, TextInput, View } from 'react-native'

import { colors } from '@/theme/colors'

export type TextFieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  secure?: boolean
}

export function TextField({ label, value, onChangeText, secure = false }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 18,
  },
})
