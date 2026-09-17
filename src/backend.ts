import { createClient } from "@supabase/supabase-js";
import type { Remote } from "./store";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ||
    "https://dgbqhlcpztojkzcqkeff.supabase.co",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_WbTDgHb6WEDFn9YguwG0BQ_dz0E2COp",
  {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
            : AbortSignal.timeout(15000),
        }),
    },
  },
);
export const remote: Remote = {
  async read() {
    const { data, error } = await supabase.rpc("baulera_read");
    if (error) throw error;
    return data;
  },
  async commit(base, op, next) {
    const { data, error } = await supabase.rpc("baulera_commit", {
      p_revision: base.revision,
      p_operation: op.id,
      p_document: next,
      p_label: op.label,
    });
    if (error) throw error;
    return data;
  },
};
export function forOwner(owner: string): Remote {
  async function check() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.user.id !== owner)
      throw Error(
        "Renová el acceso a tu cuenta en Ajustes. Tus cambios siguen guardados en este teléfono.",
      );
  }
  return {
    async read() {
      await check();
      return remote.read();
    },
    async commit(base, op, next) {
      await check();
      return remote.commit(base, op, next);
    },
  };
}
