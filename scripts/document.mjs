function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

// The early script avoids a flash of content before the intro is ready.
const introScript =
  "document.documentElement.setAttribute('data-intro-pending', '');";

export function createDocument(title, content) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="theme-color" content="#741F28">
    <title>${escapeHtml(title)} | Bareeq</title>
    <meta name="description" content="Explore Bareeq coffee, cakes and savory bites. Find us in Helwan, Mostafa Safwat Street.">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="apple-touch-icon" href="/assets/bareeq-logo.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Bareeq Founder">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="icon" href="/assets/bareeq-logo.png">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/tailwind.css">
    <script>${introScript}</script>
  </head>
  <body>
    <div id="root">${content}</div>
    <script type="module" src="/app.js"></script>
  </body>
</html>`;
}
