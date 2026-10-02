import {sha256,json,clearCookie} from '../_auth.js';
export async function onRequestPost({request,env}){const raw=request.headers.get('Cookie')||'',m=raw.match(/(?:^|;\s*)sc_session=([^;]+)/);if(m)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(decodeURIComponent(m[1]))).run().catch(()=>{});return json({ok:true},200,{'Set-Cookie':clearCookie()})}
