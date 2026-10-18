import { memo } from "react";
import {
  centavosDeDigitos,
  formatarCentavos,
  formatarCentavosSemSimbolo,
} from "../utils/dinheiro";

// Na máscara de centavos os dígitos entram sempre pela direita, então o cursor
// fica no fim. O tamanho é lido dentro do frame, depois da digitação.
const cursorParaFim = (e) => {
  const input = e.target;
  requestAnimationFrame(() => {
    const len = input.value.length;
    input.setSelectionRange(len, len);
  });
};

const ItemProduto = ({
  produto,
  acoes,
  onEditar,
  onExcluir,
  onComparar,
  comPreco = true,
  rotuloPego = "Já pegou",
  sufixoRotulo = "",
}) => {
  const { id, nome: nomeProduto, qte, preco, ultimoPreco, pego } = produto;
  // Nome usado nos rótulos de acessibilidade (na viagem inclui a pessoa).
  const nome = `${nomeProduto}${sufixoRotulo}`;
  const estimado = !preco && ultimoPreco > 0;
  const precoLinha = preco || ultimoPreco || 0;
  const precoTexto = preco ? formatarCentavosSemSimbolo(preco) : "";
  const placeholder = formatarCentavosSemSimbolo(ultimoPreco);
  // O campo cresce para caber valores grandes (ex.: "1.012,30").
  const larguraPreco = `${Math.max(precoTexto.length, placeholder.length, 5)}ch`;

  return (
    <div className={`item-card${pego ? " is-pego" : ""}`}>
      <button
        type="button"
        className={`item-check${pego ? " is-checked" : ""}`}
        onClick={() => acoes.alternarPego(id)}
        aria-label={`${rotuloPego} ${nome}?`}
        aria-pressed={pego}
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
        <div className={`item-name${pego ? " is-checked" : ""}`}>
          {nomeProduto}
        </div>
        {comPreco && (
          <div className="item-line">
            {estimado ? "≈ " : ""}
            {formatarCentavos(qte * precoLinha)}
            {estimado && (
              <button
                type="button"
                className="item-ultimo button-reset"
                onClick={() => acoes.definirPreco(id, ultimoPreco)}
                title="Usar o último preço pago"
              >
                último {formatarCentavos(ultimoPreco)} · usar
              </button>
            )}
          </div>
        )}
        <div className="item-actions">
          <button
            type="button"
            onClick={() => onEditar(produto)}
            className="button-reset"
            aria-label={`Editar ${nome}`}
          >
            <i className="bi bi-pen"></i>
          </button>
          <button
            type="button"
            onClick={() => onExcluir(produto)}
            className="button-reset"
            aria-label={`Excluir ${nome}`}
          >
            <i className="bi bi-trash3"></i>
          </button>
          {comPreco && (
            <button
              type="button"
              onClick={() => onComparar(produto)}
              className="button-reset"
              aria-label={`Comparar preços de ${nome}`}
            >
              <i className="bi bi-calculator"></i>
            </button>
          )}
        </div>
      </div>

      <div className="item-controls">
        <div className="stepper">
          <button
            type="button"
            onClick={() => acoes.decrementar(id)}
            aria-label={`Diminuir ${nome}`}
          >
            −
          </button>
          <span aria-label={`Quantidade de ${nome}`}>{qte}</span>
          <button
            type="button"
            onClick={() => acoes.incrementar(id)}
            aria-label={`Aumentar ${nome}`}
          >
            +
          </button>
        </div>
        {comPreco && (
          <div className="price-box">
            <span className="price-currency">R$</span>
            <input
              type="tel"
              inputMode="numeric"
              aria-label={`Preço de ${nome}`}
              value={precoTexto}
              style={{ width: larguraPreco }}
              onChange={(e) =>
                acoes.definirPreco(id, centavosDeDigitos(e.target.value))
              }
              onFocus={cursorParaFim}
              onClick={cursorParaFim}
              placeholder={placeholder}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ItemProduto);
