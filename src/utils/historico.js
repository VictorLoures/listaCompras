import { normalizarTexto } from "./texto";

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export const formatarData = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const chaveMes = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const rotuloMes = (chave) => {
  const [ano, mes] = chave.split("-");
  return `${MESES[Number(mes) - 1]}/${ano.slice(2)}`;
};

export const ordenarComprasRecentes = (historico) =>
  [...historico].sort((a, b) => b.data.localeCompare(a.data));

// Total gasto por mês, do mais antigo para o mais recente.
export const gastoPorMes = (historico) => {
  const totais = new Map();
  historico.forEach((compra) => {
    const chave = chaveMes(compra.data);
    const atual = totais.get(chave) || { total: 0, compras: 0 };
    totais.set(chave, {
      total: atual.total + compra.total,
      compras: atual.compras + 1,
    });
  });
  return [...totais.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, dados]) => ({ chave, rotulo: rotuloMes(chave), ...dados }));
};

const magnitude = (pct) => (pct === null ? -1 : Math.abs(pct));

// Para cada produto comprado, compara o último preço pago com o anterior.
export const variacaoDePrecos = (historico) => {
  const porProduto = new Map();
  [...historico]
    .sort((a, b) => a.data.localeCompare(b.data))
    .forEach((compra) => {
      compra.itens.forEach((item) => {
        if (!item.preco) {
          return;
        }
        const chave = normalizarTexto(item.nome);
        const registros = porProduto.get(chave) || {
          nome: item.nome,
          precos: [],
        };
        registros.precos.push({ preco: item.preco, data: compra.data });
        porProduto.set(chave, registros);
      });
    });

  return (
    [...porProduto.values()]
      .map(({ nome, precos }) => {
        const ultimo = precos[precos.length - 1];
        const anterior = precos.length > 1 ? precos[precos.length - 2] : null;
        return {
          nome,
          ultimo: ultimo.preco,
          anterior: anterior ? anterior.preco : null,
          variacaoPct: anterior
            ? ((ultimo.preco - anterior.preco) / anterior.preco) * 100
            : null,
          vezes: precos.length,
        };
      })
      // Maiores variações primeiro; produtos comprados uma vez só vão para o fim.
      .sort(
        (a, b) =>
          magnitude(b.variacaoPct) - magnitude(a.variacaoPct) ||
          a.nome.localeCompare(b.nome, "pt-BR")
      )
  );
};
