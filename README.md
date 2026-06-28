# HARDSTOREUY Service v0.4

Sistema web sencillo y profesional para controlar reparaciones del taller usando Google Apps Script + Google Sheets.

## Qué incluye esta versión

- Dashboard con estadísticas reales desde Google Sheets.
- Alta de órdenes con numeración automática: `HS-2026-000001`.
- Búsqueda por cliente, teléfono, orden, marca, modelo o falla.
- Edición básica de órdenes.
- Estados rápidos: Recibido, Diagnóstico, Esperando repuesto, Reparando, Listo para retirar, Entregado y No reparable.
- Historial automático por orden.
- Botón de WhatsApp por enlace `wa.me` con formato para Uruguay.
- Preparado para trabajar con `clasp` y GitHub.

## Instalación con clasp

1. Instala Node.js.
2. En una terminal dentro de esta carpeta ejecuta:

```bash
npm install
npm run login
```

3. Crea el proyecto en Apps Script:

```bash
npm run create
```

4. Sube los archivos:

```bash
npm run push
```

5. Abre el proyecto:

```bash
npm run open
```

6. En Apps Script, ejecuta manualmente `setupDatabase` una vez y acepta permisos.
7. Publica como aplicación web: **Deploy > New deployment > Web app**.

## Uso

Al crear la primera orden, el sistema crea automáticamente las pestañas necesarias dentro del Google Sheet asociado.

## Nota sobre WhatsApp

Esta versión abre WhatsApp Web / WhatsApp Business mediante enlace. La versión futura puede conectarse a la API oficial de WhatsApp Business si tienes el proveedor/API configurado.
