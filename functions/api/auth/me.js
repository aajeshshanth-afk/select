import {cookieUser,json} from '../_auth.js';
export async function onRequestGet({request,env}){const u=await cookieUser(request,env);return u?json({ok:true,user:u}):json({ok:false},401)}
