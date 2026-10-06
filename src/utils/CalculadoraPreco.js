// Cada unidade é convertida para uma unidade base da sua grandeza
// (g, ml ou un) para que opções em unidades diferentes possam ser comparadas.
export const UNIDADES = {
  kg: { grandeza: "massa", fator: 1000 },
  g: { grandeza: "massa", fator: 1 },
  L: { grandeza: "volume", fator: 1000 },
  ml: { grandeza: "volume", fator: 1 },
  un: { grandeza: "unidade", fator: 1 },
};

// Unidade usada para exibir o preço por unidade de cada grandeza.
const UNIDADE_EXIBICAO = {
  massa: { sigla: "kg", fator: 1000 },
  volume: { sigla: "L", fator: 1000 },
  unidade: { sigla: "un", fator: 1 },
};

const fmtMoney = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtNumero = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

// Aceita "1,6", "1.6" e "1.600,5". Com vírgula, os pontos são separador de milhar.
export const parseNumero = (valor) => {
  const texto = String(valor).trim();
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const n = parseFloat(normalizado);
  return isNaN(n) ? 0 : n;
};

export const parsePrecoMascara = (preco) =>
  parseNumero(String(preco).replace(/[^\d,]/g, ""));

export const formatPrecoMascara = (valor) => {
  const digitos = String(valor).replace(/\D/g, "");
  if (!digitos) {
    return "";
  }
  return fmtMoney(parseInt(digitos, 10) / 100);
};

const descreverOpcao = ({ quantidade, unidade }) =>
  `${fmtNumero(parseNumero(quantidade))} ${unidade}`;

const precoPorUnidade = ({ quantidade, unidade, preco }) => {
  const { grandeza, fator } = UNIDADES[unidade];
  const quantidadeBase = parseNumero(quantidade) * fator;
  const exibicao = UNIDADE_EXIBICAO[grandeza];
  return {
    grandeza,
    quantidadeBase,
    valor: (parsePrecoMascara(preco) / quantidadeBase) * exibicao.fator,
    sigla: exibicao.sigla,
  };
};

export const opcaoPreenchida = ({ quantidade, preco }) =>
  parseNumero(quantidade) > 0 && parsePrecoMascara(preco) > 0;

// Compara duas opções pelo preço por unidade de medida (R$/kg, R$/L ou R$/un).
// Retorna null enquanto alguma opção não estiver preenchida.
export const compararOpcoes = (opcaoA, opcaoB) => {
  if (!opcaoPreenchida(opcaoA) || !opcaoPreenchida(opcaoB)) {
    return null;
  }

  const a = precoPorUnidade(opcaoA);
  const b = precoPorUnidade(opcaoB);

  if (a.grandeza !== b.grandeza) {
    return {
      tipo: "incompativel",
      explicacao:
        "As unidades não são comparáveis (ex.: kg com L). Use a mesma grandeza nas duas opções.",
    };
  }

  const porUnidade = {
    A: `${fmtMoney(a.valor)}/${a.sigla}`,
    B: `${fmtMoney(b.valor)}/${b.sigla}`,
  };

  // Diferença menor que meio centavo por unidade é considerada empate.
  if (Math.abs(a.valor - b.valor) < 0.005) {
    return {
      tipo: "empate",
      porUnidade,
      explicacao: `As duas saem pelo mesmo preço: ${porUnidade.A}. Escolha a que for render melhor pra você.`,
    };
  }

  const vencedora = a.valor < b.valor ? "A" : "B";
  const perdedora = vencedora === "A" ? "B" : "A";
  const opcoes = { A: opcaoA, B: opcaoB };
  const calculos = { A: a, B: b };
  const venc = calculos[vencedora];
  const perd = calculos[perdedora];

  const economiaPct = ((perd.valor - venc.valor) / perd.valor) * 100;
  // Quanto custaria levar a mesma quantidade da opção vencedora pagando o preço da perdedora.
  const custoEquivalente =
    (perd.valor / UNIDADE_EXIBICAO[venc.grandeza].fator) * venc.quantidadeBase;
  const diferenca = custoEquivalente - parsePrecoMascara(opcoes[vencedora].preco);

  return {
    tipo: "vencedora",
    vencedora,
    porUnidade,
    economiaPct,
    explicacao:
      `A opção ${vencedora} sai a ${porUnidade[vencedora]}, contra ${porUnidade[perdedora]} ` +
      `da opção ${perdedora} — ${economiaPct.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}% mais barata. ` +
      `Levar ${descreverOpcao(opcoes[vencedora])} pelo preço da opção ${perdedora} ` +
      `custaria ${fmtMoney(custoEquivalente)}, ou seja, ${fmtMoney(diferenca)} a mais.`,
  };
};
