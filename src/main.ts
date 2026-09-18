import "./style.css";
import {
  createIcons,
  Archive,
  House,
  ShoppingBasket,
  Settings,
  Search,
  Plus,
  ArrowRight,
  Check,
  WifiOff,
  RefreshCw,
  Package,
  Clock,
  ChevronRight,
} from "lucide";
import { registerSW } from "virtual:pwa-register";
import { supabase, remote, forOwner } from "./backend";
import { recovering, renderRecovery, watchRecovery } from "./recovery";
import {
  read,
  write,
  clear,
  view,
  enqueue,
  sync,
  resolve,
  type Local,
} from "./store";
import {
  total,
  key,
  expiryLabel,
  expiryEnd,
  type Action,
  type Lot,
  type Operation,
} from "./domain";
function displayName(email: string, fallback = "") {
  const normalized = email.trim().toLowerCase();
  if (["luz@baulera.com", "luz.prueba@baulera.invalid", "luz.eramallo@gmail.com"].includes(normalized)) return "Luz";
  if (["marcos@baulera.com", "marcos.prueba@baulera.invalid", "mlegui21@gmail.com"].includes(normalized)) return "Marcos";
  return fallback || normalized.split("@")[0];
}
const app = document.getElementById("app")!;
const modal = document.createElement("dialog");
document.body.append(modal);
let local: Local | null = null,
  owner = localStorage.getItem("baulera-owner") || "",
  actor = displayName(localStorage.getItem("baulera-email") || "", localStorage.getItem("baulera-actor") || ""),
  tab = "baulera",
  search = "",
  filter = "all",
  busy = false,
  notice = "",
  error = "",
  updateAvailable = false;
const icons = () =>
  createIcons({
    icons: {
      Archive,
      House,
      ShoppingBasket,
      Settings,
      Search,
      Plus,
      ArrowRight,
      Check,
      WifiOff,
      RefreshCw,
      Package,
      Clock,
      ChevronRight,
    },
    attrs: { width: 18, height: 18, "stroke-width": 1.8 },
  });
const icon = (name: string) =>
  `<i data-lucide="${name}" aria-hidden="true"></i>`;
const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const channel = new BroadcastChannel("baulera");
async function lock<T>(work: () => Promise<T>): Promise<T> {
  if (!navigator.locks)
    throw Error("Actualizá el navegador para guardar cambios de forma segura.");
  return navigator.locks.request("baulera-write", work);
}
function report(e: unknown) {
  error =
    e instanceof Error
      ? e.message
      : (e as { message?: string })?.message ||
        "No se pudo completar la operación.";
  renderStatus();
}
function operation(action: Action, label: string): Operation {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor,
    action,
    label,
  };
}
async function act(action: Action, label: string) {
  try {
    await lock(async () => {
      local = await read(owner);
      if (!local.ready)
        throw Error("Primero completá la sincronización inicial.");
      if (local.conflict) throw Error("Primero revisá los cambios pendientes.");
      local = enqueue(local, operation(action, label));
      await write(local);
    });
    modal.close();
    notice = "Guardado en este teléfono.";
    error = "";
    channel.postMessage("change");
    render();
    void synchronize();
  } catch (e) {
    const out = modal.querySelector('[role="alert"]');
    if (modal.open && out) out.textContent = (e as Error).message;
    else report(e);
  }
}
async function synchronize() {
  if (recovering) return;
  if (!owner || busy || !navigator.onLine) return;
  busy = true;
  renderStatus();
  try {
    await navigator.locks.request(
      "baulera-sync",
      { ifAvailable: true },
      async (acquired) => {
        if (acquired)
          local = await sync(owner, forOwner(owner), write, read, lock);
        else local = await read(owner);
      },
    );
    error = "";
    channel.postMessage("change");
    render();
  } catch (e) {
    report(e);
  } finally {
    busy = false;
    renderStatus();
  }
}
function renderStatus() {
  const el = document.getElementById("status");
  if (!el) return;
  const pending = local?.queue.length || 0,
    conflict = !!local?.conflict;
  const title = conflict
    ? "Hay cambios para revisar"
    : !navigator.onLine
      ? "Sin conexión"
      : busy
        ? "Sincronizando…"
        : pending
          ? `${pending} cambios pendientes`
          : error
            ? "Sincronización pendiente"
            : "Todo sincronizado";
  el.innerHTML = `<div>${icon(!navigator.onLine ? "wifi-off" : "refresh-cw")}<span>${title}<small>${pending ? `${pending} cambios guardados en este teléfono` : local?.lastSync ? "Última sincronización: " + new Date(local.lastSync).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Necesitás una primera conexión"}</small></span></div><button data-cmd="sync" ${busy || !navigator.onLine ? "disabled" : ""} aria-label="Sincronizar">${icon("refresh-cw")}</button>`;
  const msg = document.getElementById("notice");
  if (msg) {
    msg.textContent = error || notice;
    msg.className = error ? "notice error" : "notice";
    msg.hidden = !msg.textContent;
    msg.setAttribute("role", error ? "alert" : "status");
  }
  icons();
}
function render() {
  if (recovering) return renderRecovery(app, renderLogin);
  if (!local?.ready) {
    renderLogin();
    return;
  }
  const s = view(local),
    headers: Record<string, [string, string]> = {
      baulera: ["Todo en su lugar.", "Tu reserva, a mano."],
      casa: ["Lo que tienen a mano.", "Un envase menos, cuando se termina."],
      compras: [
        "La próxima compra.",
        "Lo que falta abajo, aunque quede en casa.",
      ],
      ajustes: ["A su manera.", "Estantes, movimientos y datos."],
    };
  app.innerHTML = `<div class="shell"><header><div class="topline"><span class="brand">${icon("archive")} LA BAULERA</span><span class="people">Vos + ${actor === "Luz" ? "Marcos" : "Luz"}</span></div><h1>${headers[tab][0]}</h1><p class="subtitle">${headers[tab][1]}</p></header><div id="status" class="sync-status"></div><main>${updateAvailable ? '<div class="banner">Hay una nueva versión. <button data-cmd="update">Actualizar</button></div>' : ""}${local.conflict ? conflictHTML() : ""}${tab === "ajustes" ? settingsHTML() : `<div class="tools"><label class="search">${icon("search")}<input id="search" aria-label="Buscar productos" placeholder="Buscar ${tab === "compras" ? "en la lista" : "productos"}…" value="${esc(search)}"></label><button class="primary" data-cmd="add">${icon("plus")} Agregar</button></div>${tab !== "compras" ? `<div class="filters"><button data-filter="all" aria-pressed="${filter === "all"}">Todos</button><button data-filter="soon" aria-pressed="${filter === "soon"}">Vencen pronto</button>${tab === "baulera" ? `<button data-filter="empty" aria-pressed="${filter === "empty"}">Sin stock</button>` : ""}</div>` : ""}<div id="list">${listHTML()}</div>`}</main><div id="notice" class="notice" role="status" hidden></div><nav aria-label="Secciones">${[
    ["baulera", "archive", "Baulera"],
    ["casa", "house", "Casa"],
    ["compras", "shopping-basket", "Compras"],
    ["ajustes", "settings", "Ajustes"],
  ]
    .map(
      ([id, i, label]) =>
        `<button data-tab="${id}" aria-current="${tab === id ? "page" : "false"}">${icon(i)}<span>${label}${id === "compras" && s.shopping.length ? ` <b>${s.shopping.length}</b>` : ""}</span></button>`,
    )
    .join("")}</nav></div>`;
  document.getElementById("search")?.addEventListener("input", (e) => {
    search = (e.target as HTMLInputElement).value;
    document.getElementById("list")!.innerHTML = listHTML();
    icons();
  });
  renderStatus();
  icons();
}
function listHTML() {
  if (!local) return "";
  const s = view(local);
  if (tab === "compras")
    return (
      s.shopping
        .filter((x) => key(x.group).includes(key(search)))
        .map(
          (x) =>
            `<article class="product"><div class="row"><h2>${esc(x.group)}</h2><span class="pill">${x.bought ? "Comprado" : x.source === "auto" ? "Reposición" : "Manual"}</span></div><p class="meta">${total(s, x.group, "b") === 0 ? "Sin stock en baulera" : total(s, x.group, "b") + " en baulera"} · ${total(s, x.group, "h")} en casa</p><div class="actions"><button data-cmd="${x.bought ? "receive" : "bought"}" data-group="${esc(x.group)}" class="${x.bought ? "primary" : ""}">${icon(x.bought ? "archive" : "check")}${x.bought ? "Guardar compra" : "Marcar comprado"}</button><button data-cmd="remove-shop" data-group="${esc(x.group)}" class="quiet">Quitar</button>${x.bought ? `<button data-cmd="bought" data-group="${esc(x.group)}" class="quiet">Desmarcar</button>` : ""}</div></article>`,
        )
        .join("") ||
      emptyHTML(
        "La lista está tranquila.",
        "Agregá lo que necesiten. Los faltantes de baulera aparecen automáticamente.",
      )
    );
  const p = tab === "baulera" ? "b" : "h",
    now = Date.now(),
    soon = now + 30 * 86400000;
  const groups = [...new Set(s.lots.map((l) => l.group))]
    .filter((g) => {
      const rows = s.lots.filter((l) => l.group === g);
      return (
        rows.some((l) =>
          key(`${g} ${l.brand} ${l.category} ${l.shelf}`).includes(key(search)),
        ) &&
        (filter === "empty" ? total(s, g, p) === 0 : total(s, g, p) > 0) &&
        (filter !== "soon" ||
          rows.some((l) => l[p] > 0 && expiryEnd(l.expiry) <= soon))
      );
    })
    .sort((a, b) => a.localeCompare(b));
  return (
    groups
      .map((g) => {
        const rows = s.lots
          .filter((l) => l.group === g && (filter === "empty" || l[p] > 0))
          .sort((a, b) => expiryEnd(a.expiry) - expiryEnd(b.expiry));
        return `<article class="product"><div class="row"><h2>${esc(g)}</h2><span class="total">${total(s, g, p)} envases</span></div>${rows.map((l, i) => `<div class="lot"><div class="row"><span>${esc(l.brand)} <span class="muted">· ${esc(l.size)}</span></span><strong>× ${l[p]}</strong></div><p class="meta">${tab === "baulera" ? esc(l.shelf) + " · " : ""}${l.expiry ? "Vence " + expiryLabel(l.expiry) : "Sin vencimiento informado"}</p>${l.expiry ? `<span class="date ${expiryEnd(l.expiry) < now ? "expired" : ""}">${expiryEnd(l.expiry) < now ? "Vencimiento pasado" : expiryEnd(l.expiry) <= soon ? "Vence dentro de 30 días" : i === 0 ? "Usar primero" : ""}</span>` : ""}<div class="actions">${l[p] > 0 ? `<button data-cmd="${p === "b" ? "transfer" : "consume"}" data-id="${l.id}">${icon(p === "b" ? "arrow-right" : "check")}${p === "b" ? "Llevar a casa" : "Se terminó"}</button>` : ""}<button class="quiet" data-cmd="detail" data-id="${l.id}">Detalles ${icon("chevron-right")}</button></div></div>`).join("")}</article>`;
      })
      .join("") ||
    emptyHTML(
      "Un lugar para empezar.",
      search || filter !== "all"
        ? "No hay productos con este filtro."
        : "Ingresá tu primera compra para organizarla acá.",
    )
  );
}
function emptyHTML(title: string, body: string) {
  return `<div class="empty">${icon("package")}<h2>${title}</h2><p>${body}</p></div>`;
}
function conflictHTML() {
  const op = local!.queue[0],
    remoteState = local!.conflict!;
  return `<section class="conflict"><h2>Revisemos antes de sincronizar</h2><p>El inventario compartido cambió desde tu última sincronización.</p><p><strong>Tu próximo cambio:</strong> ${esc(op?.label)}</p><p class="meta">Último cambio compartido: ${esc(remoteState.document.history[0]?.label || "Actualización del inventario")} · ${esc(remoteState.document.history[0]?.actor || "")}</p><button data-cmd="review">Comparar y resolver</button></section>`;
}
function settingsHTML() {
  const s = view(local!);
  return `<section class="product"><h2>Estantes</h2><div class="chips">${s.shelves.map((x) => `<span class="pill">${esc(x)}</span>`).join("")}</div><button data-cmd="shelf">${icon("plus")} Agregar estante</button></section><section class="product"><h2>Este teléfono</h2><p class="meta">Sesión: ${esc(actor)}</p><p class="meta">${navigator.storage ? "Los cambios se guardan en el dispositivo antes de sincronizarse." : ""}</p><div class="actions"><button data-cmd="backup">Exportar respaldo</button><button data-cmd="persist">Conservar datos sin conexión</button><button data-cmd="reauth">Renovar acceso</button><button data-cmd="logout">Cerrar sesión</button></div></section><section class="product"><h2>Instalar en el celular</h2><p class="meta">iPhone: abrí esta página en Safari → Compartir → Agregar a inicio. Android: menú del navegador → Instalar aplicación. Abrila con internet una vez antes de bajar a la baulera.</p></section><section class="product"><h2>Últimos movimientos</h2>${
    s.history
      .slice(0, 30)
      .map(
        (h) =>
          `<div class="lot"><p>${esc(h.label)}</p><p class="meta">${esc(h.actor)} · ${new Date(h.at).toLocaleString("es-AR")}</p></div>`,
      )
      .join("") || '<p class="meta">Todavía no hay movimientos.</p>'
  }</section>`;
}
function openForm(
  title: string,
  body: string,
  save: (f: FormData) => void | Promise<void>,
  label = "Guardar",
) {
  modal.innerHTML = `<form><div class="row"><h2>${title}</h2><button type="button" data-close aria-label="Cerrar">×</button></div>${body}<p role="alert" class="error"></p><div class="actions"><button type="submit" class="primary">${label}</button><button type="button" data-close>Cancelar</button></div></form>`;
  modal
    .querySelectorAll("[data-close]")
    .forEach((b) => b.addEventListener("click", () => modal.close()));
  modal.querySelector("form")!.onsubmit = async (e) => {
    e.preventDefault();
    const b = modal.querySelector<HTMLButtonElement>("[type=submit]")!;
    b.disabled = true;
    try {
      await save(new FormData(e.target as HTMLFormElement));
    } catch (err) {
      modal.querySelector("[role=alert]")!.textContent = (err as Error).message;
    } finally {
      b.disabled = false;
    }
  };
  if (!modal.open) modal.showModal();
  icons();
}
const field = (label: string, name: string, value = "", extra = "") =>
  `<label class="field">${label}<input name="${name}" value="${esc(value)}" ${extra}></label>`;
function receive(group = "") {
  const s = view(local!);
  openForm(
    "Guardar en la baulera",
    `${field("Producto / grupo de reposición", "group", group, 'required maxlength="120" list="groups"')}<datalist id="groups">${[...new Set([...s.lots.map((l) => l.group), ...s.shopping.map((x) => x.group)])].map((g) => `<option value="${esc(g)}">`).join("")}</datalist><p class="hint">Usá “Arroz” para agrupar todas sus marcas y presentaciones.</p><div class="form-grid">${field("Marca", "brand", "", 'required maxlength="120"')}${field("Presentación", "size", "", 'required maxlength="120" placeholder="500 g"')}${field("Envases", "qty", "1", 'type="number" min="1" max="9999" step="1" required')}${field("Categoría", "category", "Almacén", 'maxlength="120"')}</div><label class="field">Precisión del vencimiento<select id="precision"><option value="date">Día, mes y año</option><option value="month">Mes y año</option></select></label>${field("Vencimiento · opcional", "expiry", "", 'type="date"')}${field("Estante", "shelf", s.shelves[0], 'required maxlength="120" list="shelves"')}<datalist id="shelves">${s.shelves.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>`,
    (f) =>
      act(
        {
          type: "receive",
          lot: {
            id: crypto.randomUUID(),
            group: String(f.get("group")),
            brand: String(f.get("brand")),
            size: String(f.get("size")),
            category: String(f.get("category")),
            expiry: String(f.get("expiry")),
            shelf: String(f.get("shelf")),
            b: Number(f.get("qty")),
            h: 0,
          },
        },
        `Ingreso: ${f.get("qty")} × ${f.get("group")} · ${f.get("brand")}`,
      ),
  );
  modal.querySelector("#precision")!.addEventListener("change", (e) => {
    const input = modal.querySelector<HTMLInputElement>("[name=expiry]")!;
    input.value = "";
    input.type = (e.target as HTMLSelectElement).value;
  });
}
function lotById(id: string) {
  const l = view(local!).lots.find((x) => x.id === id);
  if (!l) throw Error("No se encontró el producto.");
  return l;
}
function details(l: Lot) {
  openForm(
    `${esc(l.group)} · ${esc(l.brand)}`,
    `<p class="meta">${esc(l.size)} · ${expiryLabel(l.expiry)}</p><p>${l.b} en baulera · ${l.h} en casa</p><label class="field">Acción<select name="mode" id="detail-mode"><option value="move">Mover de estante</option><option value="b">Corregir cantidad en baulera</option><option value="h">Corregir cantidad en casa</option></select></label>${field("Estante", "shelf", l.shelf, 'maxlength="120" required')}${field("Cantidad real de envases", "qty", String(l.b), 'type="number" min="0" max="9999" step="1" required')}`,
    (f) =>
      f.get("mode") === "move"
        ? act(
            { type: "move", id: l.id, shelf: String(f.get("shelf")) },
            `${l.group}: mover a ${f.get("shelf")}`,
          )
        : act(
            {
              type: "adjust",
              id: l.id,
              place: f.get("mode") as "b" | "h",
              qty: Number(f.get("qty")),
            },
            `${l.group}: corregir cantidad en ${f.get("mode") === "b" ? "baulera" : "casa"} a ${f.get("qty")}`,
          ),
  );
  const qty = modal.querySelector<HTMLInputElement>("[name=qty]")!,
    shelf = modal.querySelector<HTMLInputElement>("[name=shelf]")!;
  qty.closest("label")!.hidden = true;
  modal.querySelector("#detail-mode")!.addEventListener("change", (e) => {
    const mode = (e.target as HTMLSelectElement).value;
    qty.closest("label")!.hidden = mode === "move";
    shelf.closest("label")!.hidden = mode !== "move";
    qty.value = String(mode === "h" ? l.h : l.b);
  });
}
function review() {
  const op = local!.queue[0],
    latest = local!.conflict!;
  const a = op.action;
  const l = "id" in a ? latest.document.lots.find((x) => x.id === a.id) : null;
  openForm(
    "Revisar tu cambio",
    `<p>${esc(op.label)}</p>${l ? `<p class="meta">Ahora en el inventario compartido: ${l.b} en baulera, ${l.h} en casa. Ubicación: ${esc(l.shelf)}.</p>` : ""}<p class="hint">Aplicar ejecuta tu acción sobre el estado compartido actual. Descartar omite esta acción; las demás se conservan.</p><label class="field">Qué querés hacer<select name="choice"><option value="apply">Aplicar mi acción al estado actual</option><option value="discard">Descartar esta acción</option><option value="discard-all">Descartar TODOS mis cambios pendientes</option></select></label>`,
    async (f) => {
      await lock(async () => {
        local = await read(owner);
        local = resolve(
          local,
          String(f.get("choice")) as "apply" | "discard" | "discard-all",
        );
        await write(local);
      });
      modal.close();
      channel.postMessage("change");
      render();
      void synchronize();
    },
    "Resolver",
  );
}
app.addEventListener("click", async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b) return;
  try {
    if (b.dataset.tab) {
      tab = b.dataset.tab;
      search = "";
      filter = "all";
      render();
      return;
    }
    if (b.dataset.filter) {
      filter = b.dataset.filter;
      render();
      return;
    }
    const cmd = b.dataset.cmd,
      id = b.dataset.id || "",
      group = b.dataset.group || "";
    if (cmd === "sync") await synchronize();
    if (cmd === "add") {
      if (tab === "compras")
        openForm(
          "Agregar a compras",
          field("Producto", "group", "", 'required maxlength="120"'),
          (f) =>
            act(
              { type: "shop", group: String(f.get("group")) },
              `Agregar a compras: ${f.get("group")}`,
            ),
        );
      else receive();
    }
    if (cmd === "receive") receive(group);
    if (cmd === "transfer" || cmd === "consume") {
      const l = lotById(id);
      openForm(
        cmd === "transfer" ? "Llevar a casa" : "Se terminó",
        `<p>${esc(l.group)} · ${esc(l.brand)} · ${esc(l.size)}</p><p class="meta">${l.shelf} · ${expiryLabel(l.expiry)}</p>${field("Envases", "qty", "1", `type="number" min="1" max="${cmd === "transfer" ? l.b : l.h}" step="1" required`)}`,
        (f) =>
          act(
            { type: cmd, id, qty: Number(f.get("qty")) },
            `${cmd === "transfer" ? "Llevar a casa" : "Se terminó"}: ${f.get("qty")} × ${l.group} · ${l.brand}`,
          ),
      );
    }
    if (cmd === "detail") details(lotById(id));
    if (cmd === "bought")
      await act(
        { type: "bought", group },
        `${group}: cambiar estado de compra`,
      );
    if (cmd === "remove-shop")
      openForm(
        "Quitar de compras",
        `<p>${esc(group)} dejará de estar en la lista. Volverá a agregarse si lo reponen y se agota otra vez en la baulera.</p>`,
        () =>
          act({ type: "remove-shop", group }, `Quitar de compras: ${group}`),
        "Quitar",
      );
    if (cmd === "shelf")
      openForm(
        "Nuevo estante",
        field("Nombre", "name", "", 'required maxlength="120"'),
        (f) =>
          act(
            { type: "shelf", name: String(f.get("name")) },
            `Crear estante: ${f.get("name")}`,
          ),
      );
    if (cmd === "review") review();
    if (cmd === "backup") {
      const blob = new Blob([JSON.stringify(local, null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download =
        "baulera-respaldo-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (cmd === "persist") {
      const result = await navigator.storage?.persist?.();
      notice = result
        ? "El navegador autorizó conservar los datos."
        : "El navegador administra el almacenamiento. Instalá la app y sincronizá al volver a tener señal.";
      renderStatus();
    }
    if (cmd === "reauth")
      openForm(
        "Renovar acceso",
        field(
          "Tu correo",
          "email",
          localStorage.getItem("baulera-email") || "",
          'type="email" required autocomplete="email"',
        ) +
          field(
            "Contraseña",
            "password",
            "",
            'type="password" required autocomplete="current-password"',
          ),
        async (f) => {
          const { data, error: authError } =
            await supabase.auth.signInWithPassword({
              email: String(f.get("email")),
              password: String(f.get("password")),
            });
          if (authError) throw authError;
          if (data.user.id !== owner)
            throw Error(
              "Ingresá con la misma cuenta que usaste en este teléfono. Los cambios pendientes se conservan.",
            );
          modal.close();
          error = "";
          notice = "Acceso renovado.";
          void synchronize();
        },
        "Entrar",
      );
    if (cmd === "logout") {
      if (local?.queue.length)
        throw Error(
          "Sincronizá los cambios pendientes antes de cerrar sesión.",
        );
      openForm(
        "Cerrar sesión",
        "<p>Se quitará la copia del inventario de este teléfono. Podrás descargarla de nuevo al ingresar con internet.</p>",
        async () => {
          await lock(async () => {
            const latest = await read(owner);
            if (latest.queue.length)
              throw Error("Todavía hay cambios pendientes.");
            await clear(owner);
            localStorage.removeItem("baulera-owner");
            localStorage.removeItem("baulera-actor");
            localStorage.removeItem("baulera-email");
            await supabase.auth.signOut({ scope: "local" });
            owner = "";
            local = null;
          });
          modal.close();
          channel.postMessage("logout");
          render();
        },
        "Cerrar sesión",
      );
    }
    if (cmd === "update") {
      if (local?.queue.length)
        throw Error("Sincronizá tus cambios antes de actualizar.");
      await updateSW(true);
    }
  } catch (err) {
    report(err);
  }
});
function renderLogin() {
  app.innerHTML = `<div class="shell login"><header><span class="brand">${icon("archive")} LA BAULERA</span><h1>Todo en su lugar.</h1><p class="subtitle">Su despensa compartida, incluso sin señal.</p></header><main><form id="login"><label class="field">Tu correo<input name="email" type="email" required autocomplete="email"></label><label class="field">Contraseña<input name="password" type="password" required minlength="8" autocomplete="current-password"></label><button class="primary full" name="mode" value="login">Entrar</button><button class="full" name="mode" value="signup">Crear mi acceso</button><button type="button" id="forgot-password" class="full">Olvidé mi contraseña</button><p class="hint">Acceso reservado para ustedes dos. La primera vez necesitás conexión.</p><p id="auth-message" role="alert">${esc(error)}</p></form></main></div>`;
  icons();
  const forgot = document.getElementById("forgot-password");
  if (forgot) forgot.onclick = async () => {
    const input = document.querySelector<HTMLInputElement>('#login input[name="email"]')!;
    if (!input.reportValidity()) return;
    const button = document.getElementById('forgot-password') as HTMLButtonElement;
    const out = document.getElementById('auth-message')!;
    button.disabled = true;
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(input.value.trim().toLowerCase(), {redirectTo: location.origin + '/?recuperar=1'});
      if (error) throw error;
      out.textContent = 'Solicitud enviada. Si el correo tiene una cuenta, recibirás un enlace para elegir una contraseña nueva. Revisá también spam.';
    } catch (error) {out.textContent = (error as Error).message;} finally {button.disabled = false;}
  };
  document.getElementById("login")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement),
      mode = (e as SubmitEvent).submitter as HTMLButtonElement;
    const email = String(f.get("email")).trim().toLowerCase(),
      password = String(f.get("password"));
    const out = document.getElementById("auth-message")!;
    mode.disabled = true;
    try {
      if (!navigator.onLine)
        throw Error("Conectate a internet para ingresar por primera vez.");
      const result =
        mode.value === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: location.origin },
            })
          : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) {
        out.textContent =
          "Si es un acceso nuevo, revisá tu correo para confirmarlo. Si ya tenías cuenta, usá Entrar u Olvidé mi contraseña; crear un acceso no cambia la contraseña anterior.";
        return;
      }
      const snapshot = await remote.read();
      owner = result.data.session.user.id;
      actor = displayName(email);
      await lock(async () => {
        local = await read(owner);
        if (!local.ready) {
          local.base = snapshot;
          local.ready = true;
          local.lastSync = new Date().toISOString();
          await write(local);
        }
      });
      localStorage.setItem("baulera-owner", owner);
      localStorage.setItem("baulera-actor", actor);
      localStorage.setItem("baulera-email", email);
      error = "";
      render();
      void synchronize();
    } catch (err) {
      out.textContent = (err as Error).message;
    } finally {
      mode.disabled = false;
    }
  });
}
const updateSW = registerSW({
  onNeedRefresh() {
    updateAvailable = true;
    if (local?.ready) render();
  },
  onOfflineReady() {
    notice = "Lista para abrir sin conexión en este teléfono.";
    renderStatus();
  },
  onRegisterError(e) {
    report(
      new Error("No se pudo preparar el inicio sin conexión: " + String(e)),
    );
  },
});
channel.onmessage = async (e) => {
  if (e.data === "logout") {
    owner = "";
    local = null;
    modal.close();
    render();
    return;
  }
  if (owner) {
    local = await read(owner);
    render();
  }
};
addEventListener("online", () => {
  renderStatus();
  void synchronize();
});
addEventListener("offline", renderStatus);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void synchronize();
});
setInterval(() => {
  if (document.visibilityState === "visible") void synchronize();
}, 30000);
async function start() {
  try {
    if (owner) local = await read(owner);
    render();
    if (local?.ready) void synchronize();
  } catch (err) {
    owner = "";
    local = null;
    error =
      "No se pudo abrir el almacenamiento local. No uses navegación privada.";
    render();
  }
}
watchRecovery(render);
void start();

