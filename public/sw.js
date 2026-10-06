self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Deliberately do not cache private dashboard responses or order submissions.
self.addEventListener('push',event=>{
 let data={};try{data=event.data.json();}catch{}
 event.waitUntil(self.registration.showNotification(data.title||'Bareeq',{body:data.body||'Open Bareeq for the latest orders.',icon:'/assets/bareeq-logo.png',badge:'/assets/bareeq-logo.png',tag:data.tag||'bareeq',data:{url:data.url||'/founder'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const path=event.notification.data?.url||'/founder';
 const url=new URL(path,self.location.origin);if(url.origin!==self.location.origin)return;
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{for(const client of clients){if(new URL(client.url).origin===url.origin){await client.navigate(url.href);return client.focus();}}return self.clients.openWindow(url.href);}));
});
