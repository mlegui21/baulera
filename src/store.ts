import { openDB } from "idb";
import {
  empty,
  project,
  reduce,
  type Inventory,
  type Operation,
} from "./domain";
export type Snapshot = {
  document: Inventory;
  revision: number;
  updated_at?: string;
  updated_by?: string;
};
export type Local = {
  owner: string;
  ready: boolean;
  base: Snapshot;
  queue: Operation[];
  conflict: Snapshot | null;
  lastSync: string | null;
};
const db = openDB("la-baulera-v1", 1, {
  upgrade(d) {
    d.createObjectStore("state");
  },
});
export const initial = (owner: string): Local => ({
  owner,
  ready: false,
  base: { document: empty(), revision: 0 },
  queue: [],
  conflict: null,
  lastSync: null,
});
export async function read(owner: string): Promise<Local> {
  return (await (await db).get("state", owner)) || initial(owner);
}
export async function write(state: Local) {
  await (await db).put("state", state, state.owner);
}
export async function clear(owner: string) {
  await (await db).delete("state", owner);
}
export function view(state: Local) {
  return project(state.base.document, state.queue);
}
export function enqueue(state: Local, op: Operation) {
  reduce(view(state), op);
  return { ...state, queue: [...state.queue, op] };
}
export type Remote = {
  read: () => Promise<Snapshot>;
  commit: (
    base: Snapshot,
    op: Operation,
    next: Inventory,
  ) => Promise<{ status: "ok" | "conflict"; snapshot: Snapshot }>;
};
// Serialize sync across tabs, but never hold the local write lock during a network request.
// Entries appended while an upload is in flight survive its acknowledgment.
export async function sync(
  owner: string,
  remote: Remote,
  persist = write,
  load = read,
  guard: <T>(f: () => Promise<T>) => Promise<T> = (f) => f(),
) {
  for (;;) {
    const local = await guard(() => load(owner));
    if (local.conflict) return local;
    if (!local.queue.length) {
      const snapshot = await remote.read();
      return guard(async () => {
        const current = await load(owner);
        if (current.conflict) return current;
        if (current.queue.length) {
          if (snapshot.revision !== current.base.revision)
            current.conflict = snapshot;
        } else current.base = snapshot;
        current.ready = true;
        current.lastSync = new Date().toISOString();
        await persist(current);
        return current;
      });
    }
    const op = local.queue[0],
      result = await remote.commit(
        local.base,
        op,
        reduce(local.base.document, op),
      );
    const current = await guard(async () => {
      const current = await load(owner);
      if (current.queue[0]?.id !== op.id)
        throw Error(
          "La cola cambió durante la sincronización. Volvé a intentarlo.",
        );
      if (result.status === "conflict") current.conflict = result.snapshot;
      else {
        current.base = result.snapshot;
        current.ready = true;
        current.queue.shift();
        current.lastSync = new Date().toISOString();
      }
      await persist(current);
      return current;
    });
    if (current.conflict) return current;
  }
}
export function resolve(
  local: Local,
  choice: "apply" | "discard" | "discard-all",
): Local {
  if (!local.conflict) return local;
  const queue =
    choice === "apply"
      ? local.queue
      : choice === "discard-all"
        ? []
        : local.queue.slice(1);
  // Do not silently discard dependent actions when the new server state makes them impossible.
  project(local.conflict.document, queue);
  return { ...local, base: local.conflict, conflict: null, queue };
}
