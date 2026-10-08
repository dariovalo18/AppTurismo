import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Boton } from '@/componentes/Boton';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { ErrorApi } from '@/servicios/errores';
import { paletas } from '@/tema/colores';

// Reglas de validación del formulario (zod). Los mensajes se muestran bajo cada campo.
const esquemaLogin = z.object({
  email: z.string().min(1, 'Ingresá tu email').email('El email no es válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

type FormLogin = z.infer<typeof esquemaLogin>;

export default function Login() {
  const paleta = useTema();
  const { ingresar, ingresarConBiometria, continuarComoInvitado, hayTokenGuardado } = useSesion();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', password: '' },
  });

  // Se ejecuta solo si el formulario es válido. Si el servicio falla, mostramos su mensaje.
  // Si sale bien, ProveedorSesion cambia el modo y el layout nos lleva al inicio.
  const enviar = async (valores: FormLogin) => {
    setErrorServidor(null);
    try {
      await ingresar(valores);
    } catch (e) {
      setErrorServidor(e instanceof ErrorApi ? e.message : 'No pudimos ingresar. Probá de nuevo.');
    }
  };

  // Reingreso rápido: pide huella/rostro y usa el token guardado en secure-store.
  const entrarConHuella = async () => {
    setErrorServidor(null);
    const ok = await ingresarConBiometria();
    if (!ok) setErrorServidor('No pudimos validar tu identidad. Ingresá con tu contraseña.');
  };

  // Si hay sesión guardada, ofrecemos la huella apenas se abre la app.
  useEffect(() => {
    if (hayTokenGuardado) entrarConHuella();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayTokenGuardado]);

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <KeyboardAvoidingView
        style={styles.pantalla}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          {/* Logo con fondo transparente. En modo oscuro va sobre un recuadro blanco para que se lea.
              Docs Image: https://reactnative.dev/docs/image */}
          <View style={[styles.contenedorLogo, paleta === paletas.oscuro && styles.contenedorLogoOscuro]}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Mi Ciudad Colón"
            />
          </View>

          {hayTokenGuardado ? (
            <Boton etiqueta="Entrar con huella o rostro" onPress={entrarConHuella} />
          ) : null}

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
                autoComplete="password"
                editable={!isSubmitting}
                error={errors.password?.message}
              />
            )}
          />

          {errorServidor ? (
            <Text accessibilityRole="alert" style={[styles.errorServidor, { color: paleta.error }]}>
              {errorServidor}
            </Text>
          ) : null}

          <Boton etiqueta="Ingresar" onPress={handleSubmit(enviar)} cargando={isSubmitting} />

          {/* Mapa y lugares no piden cuenta (ver PDF): se puede entrar como invitado. */}
          <Text style={[styles.nota, { color: paleta.textoSuave }]}>
            No necesitás cuenta para ver el mapa y los lugares. La cuenta sirve para guardar tus
            favoritos y tu recorrido.
          </Text>

          <Boton
            etiqueta="Continuar sin cuenta"
            variante="secundario"
            onPress={continuarComoInvitado}
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
  contenedorLogo: { alignSelf: 'center', marginBottom: 8 },
  contenedorLogoOscuro: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 },
  logo: { width: 220, height: 230 },
  errorServidor: { fontSize: 16, fontWeight: '600' },
  nota: { fontSize: 16, textAlign: 'center' },
});
