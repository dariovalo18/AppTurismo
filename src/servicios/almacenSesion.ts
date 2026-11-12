import * as SecureStore from 'expo-secure-store';

// El token va siempre en secure-store, nunca en kv-store (ver PDF).
const CLAVE_TOKEN = 'miciudad_token';

export const guardarToken = async (token: string) => {
  await SecureStore.setItemAsync(CLAVE_TOKEN, token);
};

export const leerToken = async () => {
  const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  return token;
};

export const borrarToken = async () => {
  await SecureStore.deleteItemAsync(CLAVE_TOKEN);
};