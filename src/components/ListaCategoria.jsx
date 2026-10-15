import ItemProduto from "./ItemProduto";

const ListaCategoria = ({ categoria, produtos, ...handlers }) => {
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
        <ItemProduto key={produto.id} produto={produto} {...handlers} />
      ))}
    </section>
  );
};

export default ListaCategoria;
