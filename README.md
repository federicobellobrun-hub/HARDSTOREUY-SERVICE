# HARDSTOREUY Service v1.0

Sistema web simple para gestionar reparaciones de HARDSTOREUY usando Google Apps Script + Google Sheets.

## Incluye

- Dashboard con estadísticas reales desde Google Sheets.
- Alta de órdenes de reparación.
- Listado y búsqueda de órdenes.
- Edición de órdenes.
- Estados con colores.
- Historial básico de cambios.
- Clientes automáticos por teléfono.
- WhatsApp por enlace (`wa.me`) con formato para Uruguay.
- Impresión básica de orden.
- Estructura compatible con `clasp`.

## Archivos principales

- `Code.gs`: entrada de la app y API inicial.
- `Database.gs`: base de datos en Google Sheets.
- `Utils.gs`: estados, tipos de equipo, técnicos y WhatsApp.
- `Index.html`: pantalla principal.
- `Dashboard.html`: dashboard.
- `NuevaOrden.html`: formulario de nueva orden.
- `Ordenes.html`: listado de órdenes.
- `Styles.html`: estilos visuales.
- `Script.html`: lógica del frontend.
- `appsscript.json`: configuración Apps Script.

## Instalación rápida sin clasp

1. Crea una nueva hoja de cálculo en Google Sheets.
2. Ve a **Extensiones > Apps Script**.
3. Crea los archivos con los mismos nombres del proyecto.
4. Copia y pega el contenido de cada archivo.
5. Ejecuta una vez la función `setupDatabase` desde Apps Script.
6. Autoriza permisos.
7. Publica en **Implementar > Nueva implementación > Aplicación web**.
8. Configura:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: según prefieras.
9. Copia el enlace de la app web y úsalo desde las PC del taller.

## Instalación con clasp

```bash
npm install
clasp login
clasp create --type sheets --title "HARDSTOREUY Service"
clasp push
clasp open
```

Luego ejecuta `setupDatabase` y publica como aplicación web.

## Uso

- Al crear una orden se genera un número tipo `HS-2026-000001`.
- Si el teléfono ya existe, el sistema completa datos del cliente.
- Al abrir una orden puedes editar, cambiar estado, imprimir o abrir WhatsApp.

## WhatsApp

Esta versión usa enlaces de WhatsApp (`https://wa.me/...`). No envía mensajes automáticos silenciosos todavía. Para envío automático real se integrará WhatsApp Business API en una versión posterior.

## Próximas mejoras sugeridas

- Integración WhatsApp Business API.
- Fotos del equipo en Google Drive.
- PDF profesional de ingreso/entrega.
- Stock de repuestos.
- Caja diaria.
- Portal de cliente con estado de reparación.
