import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';

import { Boton } from '@/componentes/Boton';
import { useTema } from '@/proveedores/ProveedorTema';
import { borrarAudioguia, descargarAudioguia, estaDescargada } from '@/servicios/audioguiasOffline';
import type { Lugar } from '@/tipos';

// Botón para bajar la audioguía y escucharla sin señal. Si el lugar no tiene audioguía, no muestra nada.
export function BotonDescargaAudioguia({ lugar }: { lugar: Lugar }) {
  const paleta = useTema();
  const [descargada, setDescargada] = useState(() => estaDescargada(lugar));
  const [bajando, setBajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lugar.audioguia) return null;

  const descargar = async () => {
    setBajando(true);
    setError(null);
    try {
      await descargarAudioguia(lugar);
      setDescargada(true);
    } catch {
      setError('No pudimos descargarla. Probá de nuevo cuando tengas señal.');
    } finally {
      setBajando(false);
    }
  };

  const borrar = () => {
    borrarAudioguia(lugar);
    setDescargada(false);
  };

  return (
    <View style={styles.bloque}>
      {descargada ? (
        <>
          <Text style={[styles.texto, { color: paleta.acento }]}>✓ Audioguía descargada: se escucha sin señal.</Text>
          <Boton etiqueta="Borrar la descarga" variante="secundario" onPress={borrar} />
        </>
      ) : (
        <Boton etiqueta="Descargar audioguía para usar sin señal" variante="secundario" onPress={descargar} cargando={bajando} />
      )}
      {error ? <Text style={[styles.texto, { color: paleta.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 8 },
  texto: { fontSize: 16, fontWeight: '600' },
});