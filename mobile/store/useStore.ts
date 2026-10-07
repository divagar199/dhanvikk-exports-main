import {create} from 'zustand'; import {cacheCollection} from '@/lib/offline'; import {clearSession,saveSession} from '@/lib/storage';
type State={user:any;token:string|null;cart:any[];wishlist:any[];setSession:(t:string,u:any)=>Promise<void>;logout:()=>Promise<void>;addCart:(p:any)=>void;removeCart:(id:string)=>void;setQty:(id:string,n:number)=>void;toggleWishlist:(p:any)=>void;hydrate:(cart:any[],wish:any[])=>void};
export const useStore=create<State>((set,get)=>({user:null,token:null,cart:[],wishlist:[],
setSession:async(t,u)=>{await saveSession(t,u);set({token:t,user:u})},
logout:async()=>{await clearSession();set({token:null,user:null,cart:[],wishlist:[]})},
addCart:p=>{const id=String(p.id||p._id),a=[...get().cart],e=a.find(x=>String(x.id||x._id)===id);if(e)e.quantity=(e.quantity||1)+1;else a.push({...p,quantity:1});set({cart:a});cacheCollection('cart',a).catch(()=>{})},
removeCart:id=>{const a=get().cart.filter(x=>String(x.id||x._id)!==id);set({cart:a});cacheCollection('cart',a).catch(()=>{})},
setQty:(id,n)=>{const a=n<=0?get().cart.filter(x=>String(x.id||x._id)!==id):get().cart.map(x=>String(x.id||x._id)===id?{...x,quantity:n}:x);set({cart:a});cacheCollection('cart',a).catch(()=>{})},
toggleWishlist:p=>{const id=String(p.id||p._id||p.slug),has=get().wishlist.some(x=>String(x.id||x._id||x.slug)===id),a=has?get().wishlist.filter(x=>String(x.id||x._id||x.slug)!==id):[p,...get().wishlist];set({wishlist:a});cacheCollection('wishlist',a).catch(()=>{})},
hydrate:(cart,wish)=>set({cart,wishlist:wish})}));