import { centavosDeDigitos, formatarCentavos } from "./dinheiro";

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

export const ROTULOS_OPCOES = ["A", "B", "C", "D"];
export const MIN_OPCOES = 2;
export const MAX_OPCOES = ROTULOS_OPCOES.length;

export const opcaoVazia = () => ({
  quantidade: "",
  unidade: "kg",
  preco: "",
  pacotes: "",
});

const fmtNumero = (n) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

const fmtPct = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// Aceita "1,6", "1.6" e "1.600,5". Com vírgula, os pontos são separador de milhar.
export const parseNumero = (valor) => {
  const texto = String(valor ?? "").trim();
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const n = parseFloat(normalizado);
  return isNaN(n) ? 0 : n;
};

// O preço da calculadora fica como texto mascarado ("R$ 15,99") no formulário.
export const formatPrecoMascara = (valor) => {
  const centavos = centavosDeDigitos(valor);
  return centavos ? formatarCentavos(centavos) : "";
};

export const centavosDaMascara = (preco) => centavosDeDigitos(preco);

// Quantidade de embalagens (ex.: fardo com 6 latas). Vazio conta como 1.
const numeroDePacotes = (pacotes) => {
  const n = parseNumero(pacotes);
  return n > 0 ? n : 1;
};

export const descreverOpcao = ({ quantidade, unidade, pacotes }) => {
  const n = numeroDePacotes(pacotes);
  const base = `${fmtNumero(parseNumero(quantidade))} ${unidade}`;
  return n > 1 ? `${fmtNumero(n)} × ${base}` : base;
};

const precoPorUnidade = (opcao) => {
  const { grandeza, fator } = UNIDADES[opcao.unidade];
  const quantidadeBase =
    parseNumero(opcao.quantidade) * fator * numeroDePacotes(opcao.pacotes);
  const exibicao = UNIDADE_EXIBICAO[grandeza];
  const centavos = centavosDaMascara(opcao.preco);
  return {
    grandeza,
    quantidadeBase,
    centavos,
    // Centavos por unidade de exibição (por kg, por L ou por un).
    valor: (centavos / quantidadeBase) * exibicao.fator,
    sigla: exibicao.sigla,
  };
};

export const opcaoPreenchida = ({ quantidade, preco }) =>
  parseNumero(quantidade) > 0 && centavosDaMascara(preco) > 0;

// Diferença menor que meio centavo por unidade é considerada empate.
const EMPATE = 0.5;

// Compara as opções preenchidas pelo preço por unidade de medida
// (R$/kg, R$/L ou R$/un). Retorna null enquanto houver menos de duas preenchidas.
export const compararOpcoes = (opcoes) => {
  const preenchidas = opcoes
    .map((opcao, i) => ({ opcao, rotulo: ROTULOS_OPCOES[i] }))
    .filter(({ opcao }) => opcaoPreenchida(opcao));

  if (preenchidas.length < MIN_OPCOES) {
    return null;
  }

  const calculos = preenchidas.map((item) => ({
    ...item,
    ...precoPorUnidade(item.opcao),
  }));

  if (new Set(calculos.map((c) => c.grandeza)).size > 1) {
    return {
      tipo: "incompativel",
      explicacao:
        "As unidades não são comparáveis (ex.: kg com L). Use a mesma grandeza em todas as opções.",
    };
  }

  const porUnidade = Object.fromEntries(
    calculos.map((c) => [c.rotulo, `${formatarCentavos(c.valor)}/${c.sigla}`])
  );

  const ordenadas = [...calculos].sort((a, b) => a.valor - b.valor);
  const [venc, segunda] = ordenadas;

  if (segunda.valor - venc.valor < EMPATE) {
    const empatadas = ordenadas
      .filter((c) => c.valor - venc.valor < EMPATE)
      .map((c) => c.rotulo);
    return {
      tipo: "empate",
      empatadas,
      porUnidade,
      explicacao: `${
        empatadas.length === calculos.length
          ? "Todas saem"
          : `As opções ${empatadas.join(" e ")} saem`
      } pelo mesmo preço: ${porUnidade[venc.rotulo]}. Escolha a que for render melhor pra você.`,
    };
  }

  const economiaPct = ((segunda.valor - venc.valor) / segunda.valor) * 100;
  // Quanto custaria levar a mesma quantidade da vencedora pagando o preço da segunda.
  const custoEquivalente =
    (segunda.valor / UNIDADE_EXIBICAO[venc.grandeza].fator) *
    venc.quantidadeBase;
  const diferenca = custoEquivalente - venc.centavos;
  const comparacao =
    calculos.length > 2
      ? `a segunda mais barata (opção ${segunda.rotulo}, ${porUnidade[segunda.rotulo]})`
      : `${porUnidade[segunda.rotulo]} da opção ${segunda.rotulo}`;

  return {
    tipo: "vencedora",
    vencedora: venc.rotulo,
    precoVencedora: venc.centavos,
    porUnidade,
    economiaPct,
    explicacao:
      `A opção ${venc.rotulo} sai a ${porUnidade[venc.rotulo]}, contra ${comparacao} — ` +
      `${fmtPct(economiaPct)}% mais barata. ` +
      `Levar ${descreverOpcao(venc.opcao)} pelo preço da opção ${segunda.rotulo} ` +
      `custaria ${formatarCentavos(custoEquivalente)}, ou seja, ${formatarCentavos(diferenca)} a mais.`,
  };
};
