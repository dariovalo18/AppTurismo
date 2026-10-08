import * as SecureStore from 'expo-secure-store';

// El token va siempre en secure-store, nunca en kv-store (ver PDF).
const CLAVE_TOKEN = 'miciudad_token';

export const guardarToken = (token: string) => SecureStore.setItemAsync(CLAVE_TOKEN, token);
export const leerToken = () => SecureStore.getItemAsync(CLAVE_TOKEN);
export const borrarToken = () => SecureStore.deleteItemAsync(CLAVE_TOKEN);
