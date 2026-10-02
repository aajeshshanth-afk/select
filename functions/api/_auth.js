const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let jwksCache = null;
let jwksExpiresAt = 0;

function base64urlBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodePart(value) {
  return JSON.parse(new TextDecoder().decode(base64urlBytes(value)));
}

async function getGoogleJwks() {
  const now = Date.now();
  if (jwksCache && now < jwksExpiresAt) return jwksCache;
  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) throw new Error('Unable to retrieve Google signing keys.');
  const data = await response.json();
  jwksCache = data.keys || [];
  const cacheControl = response.headers.get('cache-control') || '';
  const match = cacheControl.match(/max-age=(\d+)/i);
  const maxAge = match ? Number(match[1]) : 300;
  jwksExpiresAt = now + Math.max(60, Math.min(maxAge, 86400)) * 1000;
  return jwksCache;
}

async function verifyGoogleJwt(credential, clientId) {
  const parts = String(credential || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid Google credential.');
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodePart(encodedHeader);
  const payload = decodePart(encodedPayload);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid Google token algorithm.');

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(clientId)) throw new Error('Google token audience is invalid.');
  if (audiences.length > 1 && payload.azp !== clientId) throw new Error('Google token authorized party is invalid.');
  if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
    throw new Error('Google token issuer is invalid.');
  }
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) throw new Error('Google token has expired.');
  if (payload.nbf && payload.nbf > now + 60) throw new Error('Google token is not yet valid.');

  let keys = await getGoogleJwks();
  let jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) {
    jwksCache = null;
    jwksExpiresAt = 0;
    keys = await getGoogleJwks();
    jwk = keys.find(k => k.kid === header.kid);
  }
  if (!jwk) throw new Error('Google signing key was not found.');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    base64urlBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  if (!valid) throw new Error('Google token signature is invalid.');
  return payload;
}

export async function googleUser(credential, clientId) {
  if (!credential || !clientId) throw new Error('Authentication is not configured.');
  const payload = await verifyGoogleJwt(credential, clientId);
  if (payload.email_verified !== true) throw new Error('Google email is not verified.');
  if (!payload.sub || !payload.email) throw new Error('Google account data is incomplete.');
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    name: String(payload.name || ''),
    picture: String(payload.picture || '')
  };
}

export async function cookieUser(request,env){const raw=request.headers.get('Cookie')||'';const m=raw.match(/(?:^|;\s*)sc_session=([^;]+)/);if(!m)return null;const hash=await sha256(decodeURIComponent(m[1]));return await env.DB.prepare('SELECT u.id,u.email,u.name,u.picture FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(hash,new Date().toISOString()).first();}
export async function sha256(value){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function randomToken(){const a=new Uint8Array(32);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function cookie(token,maxAge=2592000){return `sc_session=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`}
export function clearCookie(){return 'sc_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}})}
