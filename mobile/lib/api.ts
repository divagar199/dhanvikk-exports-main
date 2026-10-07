import axios from 'axios'; import * as SecureStore from 'expo-secure-store'; import {API_URL} from '@/constants/config';
export const api=axios.create({baseURL:API_URL.replace(/\/+$/,''),timeout:15000,headers:{Accept:'application/json','Content-Type':'application/json'}});
api.interceptors.request.use(async c=>{const t=await SecureStore.getItemAsync('dhanvikk_token');if(t)c.headers.Authorization='Bearer '+t;return c;});
export const authApi={login:(email:string,password:string)=>api.post('/api/auth/login',{email,password}),register:(data:any)=>api.post('/api/auth/register',data),me:()=>api.get('/api/auth/me'),logout:()=>api.post('/api/auth/logout')};
export const productApi={list:(params?:any)=>api.get('/api/products',{params}),one:(id:string)=>api.get('/api/products/'+encodeURIComponent(id))};
export const orderApi={create:(data:any)=>api.post('/api/orders',data),mine:()=>api.get('/api/orders/my-orders'),one:(id:string)=>api.get('/api/orders/'+encodeURIComponent(id))};
export const paymentApi={createOrder:(data:any)=>api.post('/api/payment/create-order',data),verify:(data:any)=>api.post('/api/payment/verify-payment',data)};