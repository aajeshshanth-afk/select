/* SelectiCore v69 — Google Identity Services + secure backend contract. */
(function(){
  const C = Object.assign({googleClientId:'',apiBaseUrl:'',authEndpoint:'',signOutEndpoint:'',meEndpoint:'',progressEndpoint:''}, window.SelectiCoreAuthConfig||{});
  if(C.apiBaseUrl){const b=C.apiBaseUrl.replace(/\/$/,''); C.authEndpoint=C.authEndpoint||b+'/api/auth/google'; C.signOutEndpoint=C.signOutEndpoint||b+'/api/auth/logout'; C.meEndpoint=C.meEndpoint||b+'/api/auth/me'; C.progressEndpoint=C.progressEndpoint||b+'/api/progress';}
  let gisLoaded=false;
  function state(){ return window.SelectiCore.read(); }
  function profile(){
    const s=state();
    s.profile=s.profile||{name:'',email:'',picture:'',provider:'guest'};
    return s.profile;
  }
  function saveProfile(p){
    const s=state(); s.profile={...(s.profile||{}),...p}; window.SelectiCore.write(s); return s.profile;
  }
  function configured(){return !!(C.googleClientId && C.authEndpoint);}
  function googleSdk(){return !!(window.google&&window.google.accounts&&window.google.accounts.id);}
  function status(){return {googleConfigured:!!C.googleClientId,authEndpointConfigured:!!C.authEndpoint,googleSdk:googleSdk(),googleReady:configured()&&googleSdk(),profile:profile()};}
  async function restoreSession(){if(!C.meEndpoint)return null; try{const r=await fetch(C.meEndpoint,{credentials:'include'}); if(!r.ok)return null; const d=await r.json(); if(d.ok&&d.user){saveProfile({name:d.user.name||'',email:d.user.email||'',picture:d.user.picture||'',provider:'google'}); render(); return d.user;}}catch(e){} return null;}
  async function syncProgress(){if(!C.progressEndpoint)return {ok:false,message:'Cloud progress endpoint is not configured.'}; try{const r=await fetch(C.progressEndpoint,{credentials:'include'}); if(r.status===401)return {ok:false,message:'Sign in with Google first.'}; const d=await r.json(); if(d.ok&&d.progress){const local=window.SelectiCore.read(); const merged={...d.progress,profile:local.profile}; window.SelectiCore.write(merged); return {ok:true,message:'Cloud progress restored.'};} return {ok:true,message:'No cloud progress saved yet.'};}catch(e){return {ok:false,message:'Could not reach the cloud progress service.'};}}
  async function uploadProgress(){if(!C.progressEndpoint)return {ok:false,message:'Cloud progress endpoint is not configured.'}; try{const r=await fetch(C.progressEndpoint,{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({progress:window.SelectiCore.read()})}); const d=await r.json().catch(()=>({})); if(!r.ok)return {ok:false,message:d.message||'Could not save cloud progress.'}; return {ok:true,message:'Progress saved to the cloud.'};}catch(e){return {ok:false,message:'Could not reach the cloud progress service.'};}}
  function loadGIS(){
    if(gisLoaded||googleSdk()||!C.googleClientId)return Promise.resolve(googleSdk());
    return new Promise(resolve=>{
      const s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.defer=true;
      s.onload=()=>{gisLoaded=true;resolve(googleSdk())}; s.onerror=()=>resolve(false); document.head.appendChild(s);
    });
  }
  async function signIn(){
    const msg=document.getElementById('authMessage');
    if(!configured()){if(msg)msg.textContent='Google sign-in is not configured yet. Add the public client ID and secure auth endpoint in system/auth-config.js.';return;}
    const ok=await loadGIS();
    if(!ok){if(msg)msg.textContent='Google Identity Services could not be loaded. Check network access and the authorised origin.';return;}
    google.accounts.id.initialize({client_id:C.googleClientId,callback:async response=>{
      if(!response||!response.credential){if(msg)msg.textContent='Google did not return an authentication credential.';return;}
      if(msg)msg.textContent='Signing you in securely…';
      try{
        const r=await fetch(C.authEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({credential:response.credential})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok||!data.ok||!data.user)throw new Error(data.message||'Authentication failed');
        saveProfile({name:data.user.name||'',email:data.user.email||'',picture:data.user.picture||'',provider:'google'});
        if(msg)msg.textContent='Signed in with Google. Syncing your progress…';
        render();
        const saved=await uploadProgress();
        if(msg)msg.textContent=saved.ok?'Signed in with Google. Progress synced to the cloud.': 'Signed in with Google. '+saved.message;
      }catch(e){if(msg)msg.textContent='Sign-in could not be completed. '+e.message;}
    }});
    google.accounts.id.prompt();
  }
  async function signOut(){
    const msg=document.getElementById('authMessage');
    try{if(C.signOutEndpoint)await fetch(C.signOutEndpoint,{method:'POST',credentials:'include'});}catch(e){}
    saveProfile({name:'',email:'',picture:'',provider:'guest'});
    if(msg)msg.textContent='Signed out. Your local learning progress remains on this device.';
    render();
  }
  function render(){
    const p=profile(), s=status();
    const name=document.getElementById('accountName'); if(name)name.textContent=p.name||'Guest learner';
    const email=document.getElementById('accountEmail'); if(email)email.textContent=p.email||'Progress is stored on this device until cloud sync is connected.';
    const btn=document.getElementById('googleSignIn'); if(btn){btn.disabled=!s.googleConfigured;btn.textContent=p.provider==='google'?'Connected with Google':(s.googleConfigured?'Continue with Google':'Google sign-in setup');}
    const out=document.getElementById('signOut'); if(out)out.hidden=p.provider!=='google';
    const statusEl=document.getElementById('authStatus'); if(statusEl)statusEl.textContent=s.googleConfigured&&s.authEndpointConfigured?'Google authentication configured':'Google authentication not configured';
  }
  window.SelectiCoreAccount={CONFIG:C,profile,saveProfile,status,signIn,signOut,render,restoreSession,syncProgress,uploadProgress};
  document.addEventListener('DOMContentLoaded',()=>{render(); restoreSession();});
})();
