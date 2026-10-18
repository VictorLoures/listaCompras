// Todos os valores monetários do app são guardados como inteiros em centavos,
// evitando erros de ponto flutuante e strings formatadas no estado.

const formatador = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatadorSemSimbolo = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatarCentavos = (centavos) =>
  formatador.format((centavos || 0) / 100);

export const formatarCentavosSemSimbolo = (centavos) =>
  formatadorSemSimbolo.format((centavos || 0) / 100);

// Máscara de digitação em centavos: "1" → 1, "13" → 13, "1,35" → 135.
export const centavosDeDigitos = (texto) => {
  const digitos = String(texto ?? "").replace(/\D/g, "");
  return digitos ? parseInt(digitos, 10) : 0;
};

// Converte um valor monetário em texto (ex.: "R$ 1.234,56") para centavos.
// Usado na migração dos dados antigos, que guardavam o preço formatado.
export const centavosDeTexto = (texto) => {
  const limpo = String(texto ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : Math.round(n * 100);
};
