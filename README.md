# HARDSTOREUY Service v0.5

Sistema web para control de reparaciones de HARDSTOREUY usando Google Apps Script + Google Sheets.

## Novedades v0.5

- Pestañas automáticas en el mismo archivo de Google Sheets:
  - `REPARACIONES`
  - `CLIENTES`
  - `HISTORIAL`
  - `CONFIG`
- Clientes automáticos por teléfono.
- Al escribir un teléfono existente, completa nombre y dirección.
- Filtro por estado en Dashboard y Reparaciones.
- Eliminación de órdenes con confirmación.
- Garantía en días.
- Historial global de cambios.
- WhatsApp de presupuesto y WhatsApp de equipo listo.
- Mejor impresión de orden.

## Instalación rápida

1. Crea o abre una hoja de cálculo en Google Sheets.
2. Ve a **Extensiones → Apps Script**.
3. Copia estos archivos al proyecto Apps Script:
   - `Code.gs`
   - `Database.gs`
   - `Utils.gs`
   - `Index.html`
   - `Dashboard.html`
   - `NuevaOrden.html`
   - `Ordenes.html`
   - `Logo.html`
   - `Styles.html`
   - `Script.html`
   - `appsscript.json`
4. Ejecuta una vez `setupDatabase` desde Apps Script para crear las pestañas.
5. Publica como **Implementar → Nueva implementación → Aplicación web**.

## Uso con clasp

```bash
npm install
clasp login
clasp create --type sheets --title "HARDSTOREUY Service"
clasp push
```

Luego abre el proyecto en Apps Script y publica la aplicación web.

## Próxima versión sugerida v0.6

- Fotos del equipo en Google Drive.
- PDF de orden.
- Etiqueta QR para pegar en el equipo.
