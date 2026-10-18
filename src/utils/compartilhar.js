import { precoEfetivo } from "../state/lista";
import { formatarCentavos } from "./dinheiro";
import { ordenarPorNome } from "./ProdutosIniciais";

// Gera a lista em texto puro, pronta para colar no WhatsApp.
// Só entram os itens com quantidade; os já pegos aparecem riscados.
// No modo viagem (`comPreco: false`) não há valores nem total.
export const gerarTextoLista = (
  produtos,
  categorias,
  { total, titulo = "🛒 *Lista de compras*", comPreco = true } = {}
) => {
  const linhas = [titulo];

  categorias.forEach((categoria) => {
    const itens = ordenarPorNome(
      produtos.filter((p) => p.categoria === categoria.id && p.qte > 0)
    );
    if (itens.length === 0) {
      return;
    }
    linhas.push("", `*${categoria.nome}*`);
    itens.forEach((p) => {
      const preco = comPreco ? precoEfetivo(p) : 0;
      const valor = preco ? ` — ${formatarCentavos(p.qte * preco)}` : "";
      const texto = `${p.nome} ×${p.qte}${valor}`;
      linhas.push(p.pego ? `✅ ~${texto}~` : `▫️ ${texto}`);
    });
  });

  if (linhas.length === 1) {
    linhas.push("", "(lista vazia)");
  } else if (comPreco && total) {
    linhas.push("", `Total estimado: *${formatarCentavos(total)}*`);
  }

  return linhas.join("\n");
};

export const linkWhatsApp = (texto) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
