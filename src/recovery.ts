import { supabase } from './backend';

export let recovering = new URLSearchParams(location.search).has('recuperar') || new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery' || sessionStorage.getItem('baulera-recovery') === '1';
if (recovering) sessionStorage.setItem('baulera-recovery', '1');
export function watchRecovery(render: () => void) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      recovering = true;
      sessionStorage.setItem('baulera-recovery', '1');
      setTimeout(render, 0);
    }
  });
}
export function renderRecovery(app: HTMLElement, done: () => void) {
  if (document.getElementById('new-password')) return;
  app.innerHTML = `<div class="shell login"><header><span class="brand">LA BAULERA</span><h1>Tu nueva contraseña</h1><p class="subtitle">Elegí una contraseña para entrar a La Baulera.</p></header><main><form id="new-password"><label class="field">Nueva contraseña<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><label class="field">Repetir contraseña<input name="repeat" type="password" minlength="8" required autocomplete="new-password"></label><button class="primary full">Guardar contraseña</button><p id="recovery-message" role="alert"></p></form><button id="recovery-back" class="full">Volver al acceso</button></main></div>`;
  const leave = () => { recovering = false; sessionStorage.removeItem('baulera-recovery'); history.replaceState(null,'',location.pathname); done(); };
  document.getElementById('recovery-back')!.onclick = leave;
  document.getElementById('new-password')!.onsubmit = async (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement, data = new FormData(form), button = form.querySelector('button')!, out = document.getElementById('recovery-message')!;
    button.disabled = true;
    try {
      if (data.get('password') !== data.get('repeat')) throw Error('Las contraseñas no coinciden.');
      const {data:user,error} = await supabase.auth.getUser();
      if (error || !user.user) throw Error('El enlace venció o no es válido. Volvé al acceso y pedí otro desde “Olvidé mi contraseña”.');
      const result = await supabase.auth.updateUser({password: String(data.get('password'))});
      if (result.error) throw result.error;
      form.reset();
      await supabase.auth.signOut({scope:'local'});
      leave();
      const message = document.getElementById('auth-message');
      if (message) message.textContent = 'Contraseña guardada. Ahora ingresá con tu correo y la nueva contraseña.';
    } catch (error) {out.textContent = (error as Error).message;} finally {button.disabled = false;}
  };
}
