import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import type { Categoria, Preferencias } from '@/tipos';

// Opciones de las preferencias (ver PDF).
const RADIOS = [100, 250, 500];
const TEMAS: { valor: Preferencias['tema']; texto: string }[] = [
  { valor: 'sistema', texto: 'Como el teléfono' },
  { valor: 'claro', texto: 'Claro' },
  { valor: 'oscuro', texto: 'Oscuro' },
];

// Yo: perfil y preferencias (PATCH /yo) y cerrar sesión.
export default function Yo() {
  const paleta = useTema();
  const { usuario, salir, guardarPerfil } = useSesion();

  // Copia del formulario: se manda a la API recién al tocar "Guardar cambios".
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [prefs, setPrefs] = useState<Preferencias | null>(usuario?.preferencias ?? null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);

  // Cuando cambia el usuario (por ejemplo, después de guardar) se recarga el formulario.
  useEffect(() => {
    setNombre(usuario?.nombre ?? '');
    setPrefs(usuario?.preferencias ?? null);
  }, [usuario]);

  // Sin señal salen de la copia guardada en el teléfono.
  useEffect(() => {
    listarCategorias()
      .then((lista) => setCategorias([...lista].sort((a, b) => a.orden - b.orden)))
      .catch(() => setCategorias([]));
  }, []);

  // Entró como invitado: salir() lleva al login, donde puede ingresar o crear la cuenta.
  if (!usuario || !prefs) {
    return (
      <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
        <View style={styles.contenido}>
          <Ionicons name="person-circle-outline" size={72} color={paleta.acento} />
          <Text style={[styles.titulo, { color: paleta.texto }]}>Visitante</Text>
          <Text style={[styles.texto, { color: paleta.textoSuave }]}>
            Entraste sin cuenta. Con una cuenta guardás tus favoritos y tu recorrido, aunque cambies de teléfono.
          </Text>
          <Boton etiqueta="Ingresar o crear cuenta" onPress={salir} />
        </View>
      </SafeAreaView>
    );
  }

  const cambiar = <K extends keyof Preferencias>(clave: K, valor: Preferencias[K]) => {
    setMensaje(null);
    setPrefs({ ...prefs, [clave]: valor });
  };

  const alternarCategoria = (id: string) => {
    const lista = prefs.categoriasFavoritas;
    cambiar('categoriasFavoritas', lista.includes(id) ? lista.filter((c) => c !== id) : [...lista, id]);
  };

  const guardar = async () => {
    if (nombre.trim().length < 2) {
      setMensaje({ texto: 'El nombre tiene que tener al menos 2 letras.', esError: true });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      await guardarPerfil({ nombre: nombre.trim(), preferencias: prefs });
      setMensaje({ texto: 'Listo, guardamos tus cambios.', esError: false });
    } catch (e) {
      setMensaje({ texto: e instanceof Error ? e.message : 'No pudimos guardar. Probá de nuevo.', esError: true });
    } finally {
      setGuardando(false);
    }
  };

  // Sin cambios, el botón Guardar queda deshabilitado.
  const hayCambios = nombre.trim() !== usuario.nombre || JSON.stringify(prefs) !== JSON.stringify(usuario.preferencias);

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={[styles.titulo, { color: paleta.texto }]}>{usuario.nombre}</Text>
        <Text style={[styles.texto, { color: paleta.textoSuave }]}>{usuario.email}</Text>

        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Tu perfil</Text>
        <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} editable={!guardando} />

        {/* Aviso de proximidad (lo usa VigilanteProximidad, de la Persona 2) */}
        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Avisos de lugares cercanos</Text>
        <View style={[styles.filaSwitch, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
          <Text style={[styles.textoSwitch, { color: paleta.texto }]}>Avisarme cuando paso cerca de un lugar</Text>
          <Switch
            value={prefs.avisarProximidad}
            onValueChange={(v) => cambiar('avisarProximidad', v)}
            trackColor={{ true: paleta.acento, false: paleta.borde }}
            accessibilityLabel="Avisarme cuando paso cerca de un lugar"
          />
        </View>

        {prefs.avisarProximidad ? (
          <>
            <Text style={[styles.etiqueta, { color: paleta.texto }]}>¿A qué distancia?</Text>
            <View style={styles.opciones}>
              {RADIOS.map((metros) => (
                <Opcion
                  key={metros}
                  texto={`${metros} m`}
                  elegida={prefs.radioAvisoMetros === metros}
                  onPress={() => cambiar('radioAvisoMetros', metros)}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Categorías favoritas */}
        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Lo que más te interesa</Text>
        {categorias.length === 0 ? (
          <Text style={[styles.texto, { color: paleta.textoSuave }]}>
            No pudimos cargar las categorías. Probá cuando tengas señal.
          </Text>
        ) : (
          <View style={styles.opciones}>
            {categorias.map((c) => (
              <Opcion
                key={c.id}
                texto={c.nombre}
                elegida={prefs.categoriasFavoritas.includes(c.id)}
                onPress={() => alternarCategoria(c.id)}
              />
            ))}
          </View>
        )}

        {/* Tema (se guarda en la cuenta) */}
        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Colores de la app</Text>
        <View style={styles.opciones}>
          {TEMAS.map((t) => (
            <Opcion
              key={t.valor}
              texto={t.texto}
              elegida={prefs.tema === t.valor}
              onPress={() => cambiar('tema', t.valor)}
            />
          ))}
        </View>

        {mensaje ? (
          <Text
            accessibilityRole="alert"
            style={[styles.mensaje, { color: mensaje.esError ? paleta.error : paleta.acento }]}
          >
            {mensaje.texto}
          </Text>
        ) : null}

        <Boton etiqueta="Guardar cambios" onPress={guardar} cargando={guardando} deshabilitado={!hayCambios} />
        <Boton etiqueta="Cerrar sesión" variante="secundario" onPress={salir} deshabilitado={guardando} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Botón de opción: relleno si está elegido, con borde si no.
function Opcion({ texto, elegida, onPress }: { texto: string; elegida: boolean; onPress: () => void }) {
  const paleta = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: elegida }}
      style={[
        styles.opcion,
        { borderColor: paleta.acento, backgroundColor: elegida ? paleta.acento : paleta.superficie },
      ]}
    >
      <Text style={[styles.opcionTexto, { color: elegida ? paleta.sobreAcento : paleta.acento }]}>{texto}</Text>
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Botones con minHeight (no height fija) para que crezcan con la letra agrandada.
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 24, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  etiqueta: { fontSize: 18, fontWeight: '600' },
  texto: { fontSize: 18, lineHeight: 26 },
  mensaje: { fontSize: 17, fontWeight: '700' },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 64,
    borderWidth: 1,
  },
  textoSwitch: { flex: 1, fontSize: 18 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcion: { minHeight: 48, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 2 },
  opcionTexto: { fontSize: 17, fontWeight: '700' },
});
