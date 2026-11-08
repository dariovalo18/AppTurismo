import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Boton } from '@/componentes/Boton';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { ErrorApi } from '@/servicios/errores';

// Reglas de validación del formulario (zod). El refine compara las dos contraseñas.
const esquemaRegistro = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresá tu nombre'),
    email: z.string().min(1, 'Ingresá tu email').email('El email no es válido'),
    password: z.string().min(8, 'La contraseña tiene que tener al menos 8 caracteres'),
    repetir: z.string().min(1, 'Repetí la contraseña'),
  })
  .refine((v) => v.password === v.repetir, {
    message: 'Las contraseñas no coinciden',
    path: ['repetir'],
  });

type FormRegistro = z.infer<typeof esquemaRegistro>;

// Registro: mismo formulario que el login, con nombre y repetir contraseña.
export default function Registro() {
  const paleta = useTema();
  const router = useRouter();
  const { registrar } = useSesion();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: '', email: '', password: '', repetir: '' },
  });

  // Si sale bien, ProveedorSesion pasa a modo 'sesion' y el layout nos lleva al inicio.
  const enviar = async ({ nombre, email, password }: FormRegistro) => {
    setErrorServidor(null);
    try {
      await registrar({ nombre, email, password });
    } catch (e) {
      setErrorServidor(e instanceof ErrorApi ? e.message : 'No pudimos crear la cuenta. Probá de nuevo.');
    }
  };

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={[styles.titulo, { color: paleta.texto }]}>Crear cuenta</Text>
          <Text style={[styles.nota, { color: paleta.textoSuave }]}>
            Con tu cuenta guardás tus favoritos y tu recorrido, aunque cambies de teléfono.
          </Text>

          <Controller
            control={control}
            name="nombre"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Nombre"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="name"
                editable={!isSubmitting}
                error={errors.nombre?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoComplete="email"
                editable={!isSubmitting}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Contraseña"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="new-password"
                editable={!isSubmitting}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="repetir"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Repetir contraseña"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="new-password"
                editable={!isSubmitting}
                error={errors.repetir?.message}
              />
            )}
          />

          {errorServidor ? (
            <Text accessibilityRole="alert" style={[styles.errorServidor, { color: paleta.error }]}>
              {errorServidor}
            </Text>
          ) : null}

          <Boton etiqueta="Crear cuenta" onPress={handleSubmit(enviar)} cargando={isSubmitting} />
          <Boton
            etiqueta="Ya tengo cuenta"
            variante="secundario"
            onPress={() => router.back()}
            deshabilitado={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  titulo: { fontSize: 30, fontWeight: '800' },
  nota: { fontSize: 17, lineHeight: 24 },
  errorServidor: { fontSize: 16, fontWeight: '600' },
});
