self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim()),
);
// Do not cache private dashboard responses or order submissions.
function orderUrl(path = '/founder') {
  const scope = new URL(self.registration.scope);
  const target = new URL(path, scope.origin);
  if (target.origin !== scope.origin) return scope.href;
  if (!target.pathname.startsWith(scope.pathname)) {
    target.pathname = scope.pathname + target.pathname.replace(/^\//, '');
  }
  return target.href;
}
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bareeq', {
      body: data.body || 'Open Bareeq for the latest orders.',
      icon: '/assets/bareeq-logo.png',
      badge: '/assets/bareeq-logo.png',
      tag: data.tag || 'bareeq',
      data: { url: orderUrl(data.url) },
    }),
  );
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = orderUrl(event.notification.data?.url);
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.registration.scope)) {
            await client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
