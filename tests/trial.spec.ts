import { test, expect } from "@playwright/test";

test("el acceso de prueba exige contraseña y consulta el inventario compartido", async ({ page, context }) => {
  let authenticated = false;
  let reads = 0;
  await context.route("**/auth/v1/token?grant_type=password", async route => {
    const credentials = route.request().postDataJSON();
    expect(credentials.email).toBe("luz.prueba@baulera.invalid");
    if (credentials.password !== "password-only-for-test") {
      await route.fulfill({ status: 400, json: { error: "invalid_grant", error_description: "Contraseña incorrecta" } });
      return;
    }
    authenticated = true;
    const payload = Buffer.from(JSON.stringify({ sub: "trial-luz", exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url");
    await route.fulfill({ json: { access_token: `test.${payload}.signature`, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user: { id: "trial-luz", email: credentials.email, aud: "authenticated" } } });
  });
  await context.route("**/rest/v1/rpc/baulera_read", async route => {
    expect(authenticated).toBe(true);
    reads++;
    await route.fulfill({ json: { document: { version: 1, lots: [], shopping: [], shelves: ["Estante 1"], history: [] }, revision: 0 } });
  });
  await page.goto("/");
  await page.getByLabel("Tu correo").fill("luz.prueba@baulera.invalid");
  await page.getByLabel("Contraseña", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Contraseña incorrecta");
  expect(reads).toBe(0);
  await page.getByLabel("Contraseña", { exact: true }).fill("password-only-for-test");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator("#status")).toContainText("Todo sincronizado");
  expect(reads).toBeGreaterThan(0);
  expect(await page.evaluate(() => localStorage.getItem("baulera-actor"))).toBe("Luz");
  await page.reload();
  await expect(page.getByRole("button", { name: "Casa", exact: true })).toBeVisible();
});
