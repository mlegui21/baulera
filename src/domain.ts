export type Lot = {
  id: string;
  group: string;
  brand: string;
  size: string;
  category: string;
  expiry: string;
  shelf: string;
  b: number;
  h: number;
};
export type Shopping = {
  group: string;
  source: "auto" | "manual";
  bought: boolean;
};
export type Entry = { id: string; at: string; actor: string; label: string };
export type Inventory = {
  version: 1;
  lots: Lot[];
  shopping: Shopping[];
  shelves: string[];
  history: Entry[];
};
export type Action =
  | { type: "receive"; lot: Lot }
  | { type: "transfer" | "consume"; id: string; qty: number }
  | { type: "move"; id: string; shelf: string }
  | { type: "adjust"; id: string; place: "b" | "h"; qty: number }
  | { type: "shop"; group: string }
  | { type: "bought" | "remove-shop"; group: string }
  | { type: "shelf"; name: string };
export type Operation = {
  id: string;
  at: string;
  actor: string;
  action: Action;
  label: string;
};
export const empty = (): Inventory => ({
  version: 1,
  lots: [],
  shopping: [],
  shelves: ["Estante 1"],
  history: [],
});
export const key = (s: string) =>
  s.trim().normalize("NFKC").toLocaleLowerCase("es");
export function total(s: Inventory, g: string, p: "b" | "h") {
  return s.lots
    .filter((l) => key(l.group) === key(g))
    .reduce((n, l) => n + l[p], 0);
}
const text = (s: string) => {
  if (!s?.trim() || s.length > 120)
    throw Error("Completá el texto (hasta 120 caracteres).");
  return s.trim();
};
const quantity = (n: number, min = 0) => {
  if (!Number.isSafeInteger(n) || n < min || n > 9999)
    throw Error(
      "Usá una cantidad de envases enteros entre " + min + " y 9999.",
    );
  return n;
};
function addShop(s: Inventory, g: string, source: "auto" | "manual") {
  if (!s.shopping.some((x) => key(x.group) === key(g)))
    s.shopping.push({ group: g, source, bought: false });
}
export function reduce(before: Inventory, op: Operation): Inventory {
  const s = structuredClone(before),
    a = op.action;
  if (s.history.some((e) => e.id === op.id)) return s;
  if (a.type === "receive") {
    const l = structuredClone(a.lot);
    text(l.id);
    l.group = text(l.group);
    l.brand = text(l.brand);
    l.size = text(l.size);
    l.shelf = text(l.shelf);
    l.b = quantity(l.b, 1);
    l.h = 0;
    if (s.lots.some((x) => x.id === l.id))
      throw Error("Ese ingreso ya existe.");
    if (l.expiry && !/^\d{4}-\d{2}(-\d{2})?$/.test(l.expiry))
      throw Error("Revisá el vencimiento.");
    l.group =
      s.lots.find((x) => key(x.group) === key(l.group))?.group ||
      s.shopping.find((x) => key(x.group) === key(l.group))?.group ||
      l.group;
    s.lots.push(l);
    if (!s.shelves.includes(l.shelf)) s.shelves.push(l.shelf);
    s.shopping = s.shopping.filter((x) => key(x.group) !== key(l.group));
  } else if (a.type === "shop") addShop(s, text(a.group), "manual");
  else if (a.type === "shelf") {
    const name = text(a.name);
    if (!s.shelves.some((x) => key(x) === key(name))) s.shelves.push(name);
  } else if (a.type === "bought" || a.type === "remove-shop") {
    const item = s.shopping.find((x) => key(x.group) === key(a.group));
    if (!item) throw Error("El producto ya no está en Compras.");
    if (a.type === "bought") item.bought = !item.bought;
    else s.shopping = s.shopping.filter((x) => x !== item);
  } else {
    if (!("id" in a)) throw Error("Acción desconocida.");
    const l = s.lots.find((x) => x.id === a.id);
    if (!l) throw Error("No se encontró el lote.");
    const old = total(s, l.group, "b");
    if (a.type === "transfer") {
      quantity(a.qty, 1);
      if (l.b < a.qty) throw Error("No hay suficientes envases en la baulera.");
      quantity(l.h + a.qty);
      l.b -= a.qty;
      l.h += a.qty;
    }
    if (a.type === "consume") {
      quantity(a.qty, 1);
      if (l.h < a.qty) throw Error("No hay suficientes envases en casa.");
      l.h -= a.qty;
    }
    if (a.type === "adjust") l[a.place] = quantity(a.qty);
    if (a.type === "move") {
      l.shelf = text(a.shelf);
      if (!s.shelves.includes(l.shelf)) s.shelves.push(l.shelf);
    }
    if (old > 0 && total(s, l.group, "b") === 0) addShop(s, l.group, "auto");
    if (old === 0 && total(s, l.group, "b") > 0)
      s.shopping = s.shopping.filter(
        (x) => !(key(x.group) === key(l.group) && x.source === "auto"),
      );
  }
  s.history.unshift({ id: op.id, at: op.at, actor: op.actor, label: op.label });
  s.history = s.history.slice(0, 300);
  return s;
}
export function project(s: Inventory, ops: Operation[]) {
  return ops.reduce(reduce, s);
}
export function expiryLabel(value: string) {
  if (!value) return "Sin vencimiento informado";
  const parts = value.split("-");
  return parts.length === 2
    ? `${parts[1]}/${parts[0]}`
    : `${parts[2]}/${parts[1]}/${parts[0]}`;
}
export function expiryEnd(value: string) {
  if (!value) return Infinity;
  const [y, m, d] = value.split("-").map(Number);
  return d
    ? new Date(y, m - 1, d, 23, 59, 59).getTime()
    : new Date(y, m, 0, 23, 59, 59).getTime();
}
