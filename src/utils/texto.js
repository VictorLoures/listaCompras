// Remove acentos e padroniza caixa/espaços, para buscas e comparações de nomes.
export const normalizarTexto = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const criarId = (prefixo = "id") => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
