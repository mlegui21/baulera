import { test, expect } from "@playwright/test";
test("guarda sin red, reabre, repone por grupo, sincroniza y consume en casa", async ({
  page,
  context,
  browserName,
}) => {
  let server: any = {
    document: {
      version: 1,
      lots: [],
      shopping: [],
      shelves: ["Estante 1"],
      history: [],
    },
    revision: 0,
  };
  const receipts = new Map();
  await context.route("**/rest/v1/rpc/*", async (route) => {
    const req = route.request();
    if (req.url().endsWith("baulera_read"))
      return route.fulfill({ json: server });
    const p = req.postDataJSON();
    if (receipts.has(p.p_operation))
      return route.fulfill({ json: receipts.get(p.p_operation) });
    if (p.p_revision !== server.revision)
      return route.fulfill({ json: { status: "conflict", snapshot: server } });
    server = { document: p.p_document, revision: server.revision + 1 };
    const result = { status: "ok", snapshot: server };
    receipts.set(p.p_operation, result);
    return route.fulfill({ json: result });
  });
  await page.goto("/");
  await page.evaluate(async (waitForWorker) => {
    if (waitForWorker) {
    await navigator.serviceWorker.ready;
    await new Promise<void>((resolve) => {
      if (navigator.serviceWorker.controller) resolve();
      else
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        );
    });
    }
    const req = indexedDB.open("la-baulera-v1", 1);
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const d = req.result,
          tx = d.transaction("state", "readwrite");
        tx.objectStore("state").put(
          {
            owner: "test-owner",
            ready: true,
            base: {
              document: {
                version: 1,
                lots: [],
                shopping: [],
                shelves: ["Estante 1"],
                history: [],
              },
              revision: 0,
            },
            queue: [],
            conflict: null,
            lastSync: null,
          },
          "test-owner",
        );
        tx.oncomplete = () => {
          d.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
    localStorage.setItem("baulera-owner", "test-owner");
    localStorage.setItem("baulera-actor", "Prueba");
    const payload = btoa(
      JSON.stringify({
        sub: "test-owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
    localStorage.setItem(
      "sb-dgbqhlcpztojkzcqkeff-auth-token",
      JSON.stringify({
        access_token: btoa("{}") + "." + payload + ".test",
        refresh_token: "test",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: { id: "test-owner", email: "test@example.invalid" },
      }),
    );
  }, browserName === "chromium");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Todo en su lugar." }),
  ).toBeVisible();
  await context.setOffline(true);
  for (const brand of ["Gallo", "Molinos"]) {
    await page.getByRole("button", { name: "Agregar", exact: true }).click();
    await page.getByLabel("Producto / grupo de reposición").fill("Arroz");
    await page.getByLabel("Marca", { exact: true }).fill(brand);
    await page.getByLabel("Presentación").fill("500 g");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await expect(page.locator(".category")).toHaveText("Almacén");
  await expect(page.getByText("2 envases", {exact:true})).toHaveCount(0);
  await page.getByRole("button", {name:/Detalles/}).first().click();
  await page.locator("#detail-mode").selectOption("edit");
  await expect(page.getByRole("heading", {name:"Editar producto", exact:true})).toBeVisible();
  await page.getByLabel("Categoría", {exact:true}).fill("Cereales");
  await page.getByLabel("Marca", {exact:true}).fill("Gallo editado");
  await page.getByRole("button", {name:"Guardar", exact:true}).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Buscar productos").fill("Cereales");
  await expect(page.getByRole("heading", {name:"Arroz", exact:true})).toBeVisible();
  await expect(page.locator(".category")).toContainText("Cereales");
  await page.getByLabel("Buscar productos").fill("no-existe");
  await expect(page.getByRole("heading", {name:"Arroz", exact:true})).toHaveCount(0);
  await page.getByLabel("Buscar productos").fill("");
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("button", { name: "Llevar a casa", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await page.getByRole("button", { name: /Compras/ }).click();
  await expect(
    page.getByRole("heading", { name: "Arroz", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Sin stock en baulera · 2 en casa"),
  ).toBeVisible();
  if (browserName === "chromium") await page.goto("/");
  else
    test
      .info()
      .annotations.push({
        type: "limitation",
        description:
          "Offline cold navigation needs physical Safari verification; Playwright service worker support is Chromium-only.",
      });
  await expect(
    page.getByText("5 cambios guardados en este teléfono"),
  ).toBeVisible();
  await page.getByRole("button", { name: /Compras/ }).click();
  await expect(
    page.getByRole("heading", { name: "Arroz", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Sincronizar", exact: true }).click();
  await expect(page.locator("#status")).toContainText("Todo sincronizado");
  expect(server.document.shopping).toHaveLength(1);
  expect(server.document.lots.reduce((n: number, l: any) => n + l.h, 0)).toBe(
    2,
  );
  await page.getByRole("button", { name: "Casa", exact: true }).click();
  await page
    .getByRole("button", { name: "Se terminó", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".lot strong")).toHaveText(["× 1"]);
  expect(server.document.lots.find((l: any) => l.brand === "Gallo editado").category).toBe("Cereales");
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.screenshot({
    path: `test-results/${test.info().project.name}.png`,
    fullPage: true,
  });
});
