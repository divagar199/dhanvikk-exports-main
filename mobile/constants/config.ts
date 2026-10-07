import Constants from 'expo-constants';
export const API_URL=process.env.EXPO_PUBLIC_API_URL||Constants.expoConfig?.extra?.apiUrl||'https://dhanvikk-exports-api.onrender.com';