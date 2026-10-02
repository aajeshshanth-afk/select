export async function onRequest(context) {
  const response = await context.next();
  const h = new Headers(response.headers);
  h.set('X-Content-Type-Options','nosniff');
  h.set('Referrer-Policy','strict-origin-when-cross-origin');
  h.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  h.set('X-Frame-Options','DENY');
  h.set('Cross-Origin-Opener-Policy','same-origin');
  h.set('Cross-Origin-Resource-Policy','same-origin');
  h.set('Strict-Transport-Security','max-age=31536000; includeSubDomains; preload');
  h.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://accounts.google.com 'unsafe-inline'; connect-src 'self' https://accounts.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://accounts.google.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests");
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}
