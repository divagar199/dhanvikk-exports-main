import * as SecureStore from 'expo-secure-store';
export async function saveSession(token:string,user:any){await SecureStore.setItemAsync('dhanvikk_token',token);await SecureStore.setItemAsync('dhanvikk_user',JSON.stringify(user));}
export async function getSession(){const token=await SecureStore.getItemAsync('dhanvikk_token');const raw=await SecureStore.getItemAsync('dhanvikk_user');return {token,user:raw?JSON.parse(raw):null};}
export async function clearSession(){await SecureStore.deleteItemAsync('dhanvikk_token');await SecureStore.deleteItemAsync('dhanvikk_user');}