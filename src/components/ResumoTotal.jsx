import { formatarCentavos } from "../utils/dinheiro";

const LIMITE_ALERTA = 80;

export const statusOrcamento = (pct) => {
  if (pct > 100) {
    return {
      classe: "is-critico",
      icone: "bi-exclamation-octagon-fill",
      texto: "Acima do orçamento",
    };
  }
  if (pct >= LIMITE_ALERTA) {
    return {
      classe: "is-alerta",
      icone: "bi-exclamation-triangle-fill",
      texto: "Perto do limite",
    };
  }
  return {
    classe: "is-ok",
    icone: "bi-check-circle-fill",
    texto: "Dentro do orçamento",
  };
};

const ResumoTotal = ({ resumo, onEditarOrcamento }) => {
  const { total, noCarrinho, pct, orcamento, pctOrcamento, usaEstimativa } =
    resumo;
  const status = orcamento > 0 ? statusOrcamento(pctOrcamento) : null;

  return (
    <div className={`total-card${status ? ` ${status.classe}` : ""}`}>
      <div className="total-main">
        <div className="total-info">
          <div className="total-label">
            Total estimado
            {usaEstimativa && (
              <span
                className="total-hint"
                title="Inclui itens sem preço digitado, calculados pelo último preço pago"
              >
                {" "}
                · c/ últimos preços
              </span>
            )}
          </div>
          <div className="total-value" data-testid="total-estimado">
            {formatarCentavos(total)}
          </div>
          <div className="total-done">
            {formatarCentavos(noCarrinho)} já no carrinho
          </div>
        </div>
        <div
          className="progress-ring"
          role="img"
          aria-label={`${pct}% dos itens pegos`}
          style={{
            background: `conic-gradient(var(--ring-fill) ${pct}%, var(--ring-track) ${pct}%)`,
          }}
        >
          <div className="progress-ring-inner">
            <span className="progress-ring-pct">{pct}%</span>
            <span className="progress-ring-caption">pego</span>
          </div>
        </div>
      </div>

      {status ? (
        <button
          type="button"
          className="orcamento button-reset"
          onClick={onEditarOrcamento}
          aria-label="Editar orçamento"
        >
          <div className="orcamento-topo">
            <span className="orcamento-status">
              <i className={`bi ${status.icone}`} aria-hidden="true"></i>
              {status.texto}
            </span>
            <span className="orcamento-valores">
              {pctOrcamento}% de {formatarCentavos(orcamento)}
            </span>
          </div>
          <div
            className="orcamento-barra"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(pctOrcamento, 100)}
            aria-label="Uso do orçamento"
          >
            <div
              className="orcamento-preenchido"
              style={{ width: `${Math.min(pctOrcamento, 100)}%` }}
            ></div>
          </div>
          {pctOrcamento > 100 && (
            <div className="orcamento-excesso">
              {formatarCentavos(total - orcamento)} acima do limite
            </div>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="orcamento-definir button-reset"
          onClick={onEditarOrcamento}
        >
          <i className="bi bi-wallet2" aria-hidden="true"></i> Definir orçamento
        </button>
      )}
    </div>
  );
};

export default ResumoTotal;
