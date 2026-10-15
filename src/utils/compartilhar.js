import { precoEfetivo } from "../state/lista";
import { formatarCentavos } from "./dinheiro";
import { ordenarPorNome } from "./ProdutosIniciais";

// Gera a lista em texto puro, pronta para colar no WhatsApp.
// Só entram os itens com quantidade; os já pegos aparecem riscados.
export const gerarTextoLista = (produtos, categorias, { total } = {}) => {
  const linhas = ["🛒 *Lista de compras*"];

  categorias.forEach((categoria) => {
    const itens = ordenarPorNome(
      produtos.filter((p) => p.categoria === categoria.id && p.qte > 0)
    );
    if (itens.length === 0) {
      return;
    }
    linhas.push("", `*${categoria.nome}*`);
    itens.forEach((p) => {
      const preco = precoEfetivo(p);
      const valor = preco ? ` — ${formatarCentavos(p.qte * preco)}` : "";
      const texto = `${p.nome} ×${p.qte}${valor}`;
      linhas.push(p.pego ? `✅ ~${texto}~` : `▫️ ${texto}`);
    });
  });

  if (linhas.length === 1) {
    linhas.push("", "(lista vazia)");
  } else if (total) {
    linhas.push("", `Total estimado: *${formatarCentavos(total)}*`);
  }

  return linhas.join("\n");
};

export const linkWhatsApp = (texto) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
