# CrowdMix

CrowdMix permite que el público envíe pedidos de canciones y que el DJ los
gestione en tiempo real. Las propinas se coordinan directamente por Yape o
Plin; la aplicación no procesa pagos.

## Configuración

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   y registra una aplicación web.
2. Activa Firestore Database y el proveedor de autenticación anónima.
3. Copia la configuración de la aplicación web en `js/firebase-config.js`.
4. Publica las reglas de `firestore.rules` en la sección Firestore → Reglas.
5. Sirve esta carpeta mediante un servidor local o HTTPS. No abras `index.html`
   directamente como archivo, porque los módulos y el service worker requieren
   un origen web.

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy.yml` publica automáticamente el sitio en
GitHub Pages al subir cambios a la rama `main`. En GitHub, abre **Settings →
Pages** y selecciona **GitHub Actions** como fuente de publicación. También
puedes ejecutar el workflow manualmente desde **Actions → Deploy CrowdMix to
GitHub Pages → Run workflow**.

Para este repositorio, la URL del sitio será
`https://luiguieducationbusiness-droid.github.io/Pedidos_DJ/`. En Firebase
Console, agrega `luiguieducationbusiness-droid.github.io` a **Authentication →
Settings → Authorized domains**; de lo contrario, la autenticación anónima
puede fallar desde el sitio publicado.

## Uso

- **DJ:** abre `host.html`, completa los datos y crea un evento. Comparte el
  código o el QR con el público; desde el tablero puedes gestionar pedidos,
  pausar la recepción y actualizar los datos para propinas.
- **Público:** abre `index.html`, ingresa el código del evento y envía una
  canción. Los pedidos y sus estados aparecen en tiempo real.
- **Pantalla grande:** desde el tablero del DJ, abre “Pantalla grande” para
  mostrar la canción actual, el QR y la cola.

El tablero del DJ está ligado a la sesión anónima del navegador donde se creó
el evento. El código del evento por sí solo no permite recuperar el control
desde otro navegador o dispositivo.

## Nota de seguridad

Las reglas incluidas son una base para pruebas y eventos pequeños, no una
garantía de seguridad para eventos de alto riesgo. Revisa y adapta las reglas
antes de usar la aplicación en producción. Las propinas no se cobran ni se
verifican dentro de CrowdMix.
