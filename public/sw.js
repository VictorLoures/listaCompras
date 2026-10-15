// Service worker da Lista de Compras: deixa o app abrir sem internet.
// - Navegação: tenta a rede e cai para o index.html em cache se estiver offline.
// - Arquivos do app e fontes: servidos do cache e atualizados em segundo plano.
// Troque a versão para forçar a limpeza dos caches antigos.
const VERSAO = "v2";
const CACHE = `lista-compras-${VERSAO}`;
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./basket.svg",
  "./favicon.ico",
  "./logo192.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter(
              (chave) => chave.startsWith("lista-compras-") && chave !== CACHE
            )
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});

const podeCachear = (url) =>
  url.origin === self.location.origin ||
  url.hostname === "fonts.googleapis.com" ||
  url.hostname === "fonts.gstatic.com";

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    evento.respondWith(
      fetch(request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put("./index.html", copia));
          return resposta;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  const url = new URL(request.url);
  if (!podeCachear(url)) {
    return;
  }

  // Stale-while-revalidate.
  evento.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((emCache) => {
        const daRede = fetch(request)
          .then((resposta) => {
            if (resposta.ok || resposta.type === "opaque") {
              cache.put(request, resposta.clone());
            }
            return resposta;
          })
          .catch(() => emCache);
        return emCache || daRede;
      })
    )
  );
});
