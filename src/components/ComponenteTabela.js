const ComponenteTabela = ({
  titulo,
  produtos,
  onInc,
  onDec,
  onToggleCheck,
  onChangePreco,
  onClickEditProduto,
  onClickRemoverProduto,
  linhaFmt,
}) => {
  if (!produtos || produtos.length === 0) {
    return null;
  }

  const precoInput = (preco) => preco.replace("R$", "").trim();

  return (
    <div>
      <div className="cat-label">{titulo}</div>
      {produtos.map((prod) => (
        <div className="item-card" key={prod.produto}>
          <button
            className={`item-check${prod.m1 ? " is-checked" : ""}`}
            onClick={() => onToggleCheck(prod)}
            aria-label="Já pegou?"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5L20 7"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>

          <div className="item-body">
            <div className={`item-name${prod.m1 ? " is-checked" : ""}`}>
              {prod.produto}
            </div>
            <div className="item-line">{linhaFmt(prod)}</div>
            {prod.isAdicional && (
              <div className="item-adicional-actions">
                <button
                  onClick={() => onClickEditProduto(prod)}
                  className="button-reset"
                  aria-label="Editar produto"
                >
                  <i className="bi bi-pen"></i>
                </button>
                <button
                  onClick={() => onClickRemoverProduto(prod)}
                  className="button-reset"
                  aria-label="Excluir produto"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            )}
          </div>

          <div className="item-controls">
            <div className="stepper">
              <button onClick={() => onDec(prod)} aria-label="Diminuir">
                −
              </button>
              <span>{prod.qte}</span>
              <button onClick={() => onInc(prod)} aria-label="Aumentar">
                +
              </button>
            </div>
            <div className="price-box">
              <span className="price-currency">R$</span>
              <input
                type="tel"
                inputMode="decimal"
                value={precoInput(prod.preco)}
                onChange={(e) => onChangePreco(e.target.value, prod)}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponenteTabela;
