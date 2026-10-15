import { useEffect } from "react";

const COR_BARRA = { claro: "#ffffff", escuro: "#151917" };

// Aplica o tema escolhido ("auto", "claro" ou "escuro") no <html>.
// Em "auto" o CSS segue o prefers-color-scheme do sistema.
export const useTema = (tema) => {
  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === "claro" || tema === "escuro") {
      raiz.dataset.theme = tema;
    } else {
      delete raiz.dataset.theme;
    }

    // Força a cor da barra do navegador quando o tema não é automático.
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      if (!meta.dataset.media) {
        meta.dataset.media = meta.getAttribute("media") || "";
      }
      if (COR_BARRA[tema]) {
        meta.setAttribute("content", COR_BARRA[tema]);
        meta.removeAttribute("media");
      } else {
        meta.setAttribute("media", meta.dataset.media);
        meta.setAttribute(
          "content",
          meta.dataset.media.includes("dark")
            ? COR_BARRA.escuro
            : COR_BARRA.claro
        );
      }
    });
  }, [tema]);
};
