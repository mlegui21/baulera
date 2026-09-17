# La Baulera

Aplicación móvil web para compartir el inventario de supermercado entre baulera y casa. Permite trabajar sin señal y sincronizar al recuperar conexión.

## Estado del proyecto

Código de la aplicación y configuración de publicación completos en este repositorio. Base de datos aplicada en Supabase, proyecto `dgbqhlcpztojkzcqkeff`, migración `20260917134130_baulera_offline_fresh_start`. Publicación en Cloudflare pendiente.

Los documentos de diseño anteriores se conservan como antecedentes; este README y el código describen la implementación actual.

## Funciones

- Lotes por producto genérico, marca, presentación, vencimiento opcional y estante.
- Traslado de envases completos de baulera a casa y consumo en casa.
- Compras manuales y automáticas cuando el total del producto genérico en baulera llega a cero, aunque queden unidades en casa.
- Compras agrupadas, recepción de mercadería y estantes personalizados.
- Datos y operaciones pendientes guardados en IndexedDB; aplicación instalable con caché local.
- Sincronización con revisiones e identificadores de operación para evitar duplicados. Los conflictos requieren revisión explícita.
- Acceso restringido a dos integrantes mediante una lista privada en el servidor.

## Desarrollo y pruebas

Requiere Node.js 24. Copiar `.env.example` a `.env.local` si se desea configurar otro proyecto. La clave publishable es pública por diseño; nunca colocar claves secretas o service_role en el frontend.

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Validación realizada: 14 pruebas unitarias y 2 pruebas de navegador, compilación de producción y verificación transaccional de permisos, conflictos e idempotencia en Supabase. Las pruebas de navegador simulan el transporte a Supabase. La prueba de WebKit cubre operaciones sin conexión y posterior sincronización, pero no la reapertura en frío sin conexión; esta última debe comprobarse en un iPhone físico instalado desde Safari.

## Base de datos

`database/setup.sql` contiene el esquema aplicado. Es un script de instalación desde cero que elimina tablas del diseño anterior: no volver a ejecutarlo sobre una instalación con datos. `database/verify.sql` verifica el protocolo y permisos dentro de una transacción que se revierte.

El estado, los miembros y los recibos están en el esquema `private`, con RLS y sin acceso directo de clientes. La aplicación utiliza únicamente las funciones públicas `baulera_read` y `baulera_commit`, que comprueban la membresía. Los correos autorizados se configuraron directamente en Supabase y no se incluyen en este repositorio público.

## Publicación pendiente

`wrangler.jsonc` configura los archivos estáticos de `dist` en Cloudflare Workers. Después de autorizar la cuenta y ejecutar la compilación, publicar con Wrangler. Configurar la URL definitiva y las redirecciones en Supabase Auth, comprobar el envío de confirmaciones y probar el acceso de ambos integrantes.

Para el primer uso se necesita conexión para ingresar y descargar la aplicación. Antes de bajar a la baulera, abrirla y comprobar que indique que está sincronizada. Los cambios pendientes permanecen en ese dispositivo hasta sincronizar: no borrar los datos del navegador mientras haya operaciones pendientes. La aplicación ofrece exportación local como respaldo.
