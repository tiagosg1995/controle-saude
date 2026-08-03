const CACHE = "controle-saude-v2";

const arquivos = [

    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    "./icone-192.png",
    "./icone-512.png"

];
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE)
            .then(cache => cache.addAll(arquivos))

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => {

                console.log("PWA instalado.");

            });

    });

}