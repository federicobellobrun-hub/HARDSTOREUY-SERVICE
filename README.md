# HARDSTOREUY Service v0.3-clasp

Sistema web simple para gestión de reparaciones usando Google Apps Script + Google Sheets.

## Esta versión agrega flujo con clasp

Con `clasp` puedes subir el proyecto a Google Apps Script con un solo comando y mantener todo versionado en GitHub.

## Instalación recomendada

### 1) Instalar Node.js
Descarga e instala Node.js LTS en tu PC.

### 2) Instalar dependencias
En la carpeta del proyecto ejecuta:

```bash
npm install
```

### 3) Iniciar sesión en Google
```bash
npm run login
```

### 4) Crear el proyecto de Apps Script conectado a una hoja Google Sheets
```bash
npm run create
```

Esto crea un proyecto nuevo de Apps Script tipo Sheets y genera el archivo `.clasp.json` localmente.

### 5) Subir el código
```bash
npm run push
```

### 6) Abrir Apps Script
```bash
npm run open
```

En Apps Script ejecuta una vez la función:

```js
setupDatabase
```

Autoriza los permisos cuando Google lo pida.

### 7) Publicar como app web
En Apps Script:

- Implementar → Nueva implementación.
- Tipo: Aplicación web.
- Ejecutar como: tú.
- Acceso: cualquiera con el enlace, o solo usuarios autorizados si prefieres privacidad.

## Archivos principales

- `Code.gs`: entrada de la aplicación y API inicial.
- `Database.gs`: base de datos en Google Sheets.
- `Index.html`: estructura general.
- `Styles.html`: diseño minimalista.
- `Script.html`: lógica frontend.
- `Logo.html`: logo integrado.

## Notas

- No subas `.clasp.json` a GitHub si tu repositorio es público.
- El sistema usa una hoja `REPARACIONES` y una pestaña oculta `CONFIG`.
- La numeración automática usa formato `HS-AAAA-000001`.

## Próxima versión

- Impresión A4 profesional.
- Fotos del equipo.
- PDF de comprobante.
- WhatsApp Business API oficial.
