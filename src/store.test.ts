import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import {
  initial,
  write,
  read,
  enqueue,
  view,
  sync,
  resolve,
  type Remote,
  type Snapshot,
} from "./store";
import { empty, type Operation } from "./domain";
const action = (): Operation => ({
  id: crypto.randomUUID(),
  at: new Date().toISOString(),
  actor: "Prueba",
  label: "Agregar arroz",
  action: { type: "shop", group: "Arroz" },
});
it("guarda los cambios antes de sincronizar y sobrevive al volver a leer el dispositivo", async () => {
  const owner = crypto.randomUUID();
  const s = enqueue({ ...initial(owner), ready: true }, action());
  await write(s);
  const restored = await read(owner);
  expect(restored.queue).toHaveLength(1);
  expect(view(restored).shopping[0].group).toBe("Arroz");
});
it("un error de red conserva toda la cola", async () => {
  const owner = crypto.randomUUID();
  await write(enqueue({ ...initial(owner), ready: true }, action()));
  const remote: Remote = {
    read: async () => {
      throw Error("sin red");
    },
    commit: async () => {
      throw Error("sin red");
    },
  };
  await expect(sync(owner, remote)).rejects.toThrow();
  expect((await read(owner)).queue).toHaveLength(1);
});
it("un acuse perdido se reintenta con el mismo ID y no duplica el cambio", async () => {
  const owner = crypto.randomUUID();
  await write(enqueue({ ...initial(owner), ready: true }, action()));
  let calls = 0;
  let server: Snapshot = { document: empty(), revision: 0 };
  const receipts = new Map();
  const remote: Remote = {
    read: async () => server,
    commit: async (base, op, next) => {
      calls++;
      if (receipts.has(op.id)) return receipts.get(op.id);
      server = { document: next, revision: 1 };
      const res = { status: "ok" as const, snapshot: server };
      receipts.set(op.id, res);
      throw Error("respuesta perdida");
    },
  };
  await expect(sync(owner, remote)).rejects.toThrow();
  await sync(owner, remote);
  expect(calls).toBe(2);
  expect(server.document.shopping).toHaveLength(1);
  expect((await read(owner)).queue).toHaveLength(0);
});
it("un conflicto no sobrescribe datos y requiere una decisión explícita", async () => {
  const owner = crypto.randomUUID();
  await write(enqueue({ ...initial(owner), ready: true }, action()));
  const snapshot = {
    document: { ...empty(), shelves: ["Estante de Luz"] },
    revision: 3,
  };
  const remote: Remote = {
    read: async () => snapshot,
    commit: async () => ({ status: "conflict", snapshot }),
  };
  const s = await sync(owner, remote);
  expect(s.queue).toHaveLength(1);
  expect(s.base.revision).toBe(0);
  expect(s.conflict?.revision).toBe(3);
  const applied = resolve(s, "apply");
  expect(view(applied).shelves).toEqual(["Estante de Luz"]);
  expect(view(applied).shopping).toHaveLength(1);
  const discarded = resolve(s, "discard");
  expect(discarded.queue).toHaveLength(0);
});
it("el almacenamiento separa cuentas", async () => {
  const a = crypto.randomUUID(),
    b = crypto.randomUUID();
  await write(enqueue(initial(a), action()));
  expect((await read(b)).queue).toHaveLength(0);
});
it("conserva una acción creada mientras otro cambio se está enviando", async () => {
  const owner = crypto.randomUUID();
  await write(enqueue({ ...initial(owner), ready: true }, action()));
  let server: Snapshot = { document: empty(), revision: 0 },
    calls = 0;
  const remote: Remote = {
    read: async () => server,
    commit: async (base, op, next) => {
      if (calls++ === 0) {
        const later = {
          ...action(),
          action: { type: "shop" as const, group: "Aceite" },
        };
        await write(enqueue(await read(owner), later));
      }
      server = { document: next, revision: base.revision + 1 };
      return { status: "ok", snapshot: server };
    },
  };
  await sync(owner, remote);
  expect(calls).toBe(2);
  expect(server.document.shopping.map((x) => x.group)).toEqual([
    "Arroz",
    "Aceite",
  ]);
  expect((await read(owner)).queue).toHaveLength(0);
});
it("una descarga no pisa una acción creada durante la petición", async () => {
  const owner = crypto.randomUUID();
  await write({ ...initial(owner), ready: true });
  const remote: Remote = {
    read: async () => {
      await write(enqueue(await read(owner), action()));
      return {
        document: { ...empty(), shelves: ["Estante de Luz"] },
        revision: 1,
      };
    },
    commit: async () => {
      throw Error("unexpected");
    },
  };
  const result = await sync(owner, remote);
  expect(result.queue).toHaveLength(1);
  expect(result.conflict?.revision).toBe(1);
  expect(view(result).shopping).toHaveLength(1);
});
