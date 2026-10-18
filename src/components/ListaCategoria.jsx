import ItemProduto from "./ItemProduto";

// `rotuloComGrupo`: inclui o nome do grupo nos rótulos de acessibilidade,
// necessário quando o mesmo item aparece em vários grupos (modo viagem).
const ListaCategoria = ({
  categoria,
  produtos,
  rotuloComGrupo = false,
  ...handlers
}) => {
  if (!produtos || produtos.length === 0) {
    return null;
  }

  return (
    <section aria-label={categoria.nome}>
      <h2 className="cat-label">
        {categoria.nome}
        <span className="cat-label-count">{produtos.length}</span>
      </h2>
      {produtos.map((produto) => (
        <ItemProduto
          key={produto.id}
          produto={produto}
          sufixoRotulo={rotuloComGrupo ? ` (${categoria.nome})` : ""}
          {...handlers}
        />
      ))}
    </section>
  );
};

export default ListaCategoria;
