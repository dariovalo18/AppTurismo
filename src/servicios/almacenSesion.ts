import * as SecureStore from 'expo-secure-store';

// El token va siempre en secure-store, nunca en kv-store (ver PDF).
const CLAVE_TOKEN = 'miciudad_token';

// Solo para depurar: muestra el token recortado.
const recortar = (token: string | null) =>
  token ? `${token.slice(0, 12)}…${token.slice(-6)} (${token.length} caracteres)` : null;

export const guardarToken = async (token: string) => {
  await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  console.log('[SecureStore] guardado', { clave: CLAVE_TOKEN, valor: recortar(token) });
};

export const leerToken = async () => {
  const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  console.log('[SecureStore] leído', { clave: CLAVE_TOKEN, valor: recortar(token) });
  return token;
};

export const borrarToken = async () => {
  await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  console.log('[SecureStore] borrado', { clave: CLAVE_TOKEN });
};
