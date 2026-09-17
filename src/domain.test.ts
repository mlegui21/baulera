import { describe, it, expect } from "vitest";
import {
  empty,
  reduce,
  total,
  expiryEnd,
  type Action,
  type Operation,
  type Inventory,
} from "./domain";
const op = (action: Action): Operation => ({
  id: crypto.randomUUID(),
  at: new Date().toISOString(),
  actor: "Prueba",
  label: action.type,
  action,
});
function receive(id: string, brand: string, g = "Arroz"): Operation {
  return op({
    type: "receive",
    lot: {
      id,
      group: g,
      brand,
      size: "500 g",
      category: "Almacén",
      expiry: "2027-01",
      shelf: "Estante 1",
      b: 1,
      h: 0,
    },
  });
}
describe("Reglas de la despensa", () => {
  it("repone solo al agotarse la baulera, agrupando marcas aunque queden envases en casa", () => {
    let s = reduce(
      reduce(empty(), receive("a", "Gallo")),
      receive("b", "Molinos"),
    );
    s = reduce(s, op({ type: "transfer", id: "a", qty: 1 }));
    expect(s.shopping).toEqual([]);
    s = reduce(s, op({ type: "transfer", id: "b", qty: 1 }));
    expect(total(s, "Arroz", "h")).toBe(2);
    expect(s.shopping).toEqual([
      { group: "Arroz", source: "auto", bought: false },
    ]);
  });
  it("no duplica compras manuales y conserva lotes y vencimientos", () => {
    let s = reduce(empty(), receive("a", "Gallo"));
    s = reduce(s, op({ type: "shop", group: " arroz " }));
    s = reduce(s, op({ type: "transfer", id: "a", qty: 1 }));
    expect(s.shopping).toHaveLength(1);
    expect(s.lots[0].expiry).toBe("2027-01");
  });
  it("se terminó solo descuenta casa y no retira el faltante de compras", () => {
    let s = reduce(empty(), receive("a", "Gallo"));
    s = reduce(s, op({ type: "transfer", id: "a", qty: 1 }));
    s = reduce(s, op({ type: "consume", id: "a", qty: 1 }));
    expect(s.shopping).toHaveLength(1);
    expect(total(s, "Arroz", "h")).toBe(0);
  });
  it("no acepta negativos, fracciones ni retirar más de lo disponible", () => {
    const s = reduce(empty(), receive("a", "Gallo"));
    for (const qty of [-1, 0, 0.5, 2])
      expect(() => reduce(s, op({ type: "transfer", id: "a", qty }))).toThrow();
  });
  it("comprar no altera stock y guardar la compra cierra la reposición", () => {
    let s = reduce(empty(), op({ type: "shop", group: "Arroz" }));
    s = reduce(s, op({ type: "bought", group: "Arroz" }));
    expect(s.lots).toHaveLength(0);
    s = reduce(s, receive("a", "Gallo"));
    expect(s.shopping).toHaveLength(0);
    expect(s.lots[0].b).toBe(1);
  });
  it("repetir un movimiento no lo aplica dos veces", () => {
    const a = receive("a", "Gallo");
    expect(reduce(reduce(empty(), a), a).lots).toHaveLength(1);
  });
  it("un vencimiento mensual conserva el mes y ordena por su último día", () => {
    expect(expiryEnd("2027-02")).toBe(
      new Date(2027, 2, 0, 23, 59, 59).getTime(),
    );
    expect(expiryEnd("")).toBe(Infinity);
  });
});
