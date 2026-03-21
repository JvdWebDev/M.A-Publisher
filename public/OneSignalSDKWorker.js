// OneSignal Service Worker Standard Code
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "M.A. Publisher";
  const options = {
    body: data.body || "Navi update aavi chhe!",
    icon: "/icon-192.png", // Tamara public folder ma icon hovo joie
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});