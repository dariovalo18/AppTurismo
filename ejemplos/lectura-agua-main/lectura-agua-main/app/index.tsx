import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { colors } from '@/theme/colors'
import { useTheme } from '@/hooks/use-theme'
import { useContext } from 'react';
import { ThemeContext } from '@/providers/ThemeProvider';
import { ThemedView } from '@/components/ThemedView';

// P-13: the field is legajo, as in the prototype. The username contract stays open.
const loginSchema = z.object({
  legajo: z.string().min(1, 'Ingresá el legajo'),
  password: z.string().min(1, 'Ingresá la contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function SignInScreen() {

  const { paleta, setTema, tema } = useTheme();


  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { legajo: '', password: '' },
  })

  const signIn = () => {

    router.replace('/rutas')

  }

  const cambiarTema = () => {
    setTema(tema === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemedView style={styles.screen}>
      <Text style={styles.label}>Legajo</Text>
      <Controller
        control={control}
        name="legajo"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        )}
      />
      {errors.legajo ? <Text style={styles.error}>{errors.legajo.message}</Text> : null}

      <Text style={styles.label}>Contraseña</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            style={styles.input}
          />
        )}
      />
      {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}

      <Pressable accessibilityRole="button" onPress={handleSubmit(signIn)} style={styles.primary}>
        <Text style={styles.primaryLabel}>Ingresar</Text>
      </Pressable>

      {/* Does not read a fingerprint. Sign-in rules stay at P-13 and P-14. */}
      <Pressable accessibilityRole="button" onPress={cambiarTema} style={styles.secondary}>
        <Text style={styles.secondaryLabel}>Entrar con huella</Text>
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    marginTop: 8,
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
  error: {
    color: colors.accentMuted,
    fontSize: 14,
  },
  primary: {
    minHeight: 48,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  primaryLabel: {
    color: colors.onAccent,
    fontSize: 18,
  },
  secondary: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryLabel: {
    color: colors.text,
    fontSize: 18,
  },
})
