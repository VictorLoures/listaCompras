import { useEffect, useState } from "react";

export const wakeLockSuportado = () =>
  typeof navigator !== "undefined" && "wakeLock" in navigator;

// Mantém a tela ligada enquanto `ativo` for verdadeiro (Screen Wake Lock API).
// O navegador solta o bloqueio quando a aba fica oculta, então ele é pedido
// de novo sempre que a página volta a ficar visível. Devolve se o bloqueio
// está ativo e se o navegador recusou o pedido (ex.: economia de bateria).
export const useTelaLigada = (ativo) => {
  const [bloqueado, setBloqueado] = useState(false);
  const [recusado, setRecusado] = useState(false);

  useEffect(() => {
    if (!ativo || !wakeLockSuportado()) {
      return undefined;
    }

    let sentinela = null;
    let cancelado = false;

    const pedir = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      try {
        sentinela = await navigator.wakeLock.request("screen");
        if (cancelado) {
          sentinela.release();
          return;
        }
        setBloqueado(true);
        setRecusado(false);
        sentinela.addEventListener("release", () => setBloqueado(false));
      } catch {
        if (!cancelado) {
          setBloqueado(false);
          setRecusado(true);
        }
      }
    };

    pedir();
    document.addEventListener("visibilitychange", pedir);

    return () => {
      cancelado = true;
      document.removeEventListener("visibilitychange", pedir);
      if (sentinela) {
        sentinela.release().catch(() => {});
      }
      setBloqueado(false);
      setRecusado(false);
    };
  }, [ativo]);

  return { bloqueado, recusado };
};
