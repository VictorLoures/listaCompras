import Modal from "./Modal";
import { wakeLockSuportado } from "../hooks/useTelaLigada";
import {
  centavosDeDigitos,
  formatarCentavosSemSimbolo,
} from "../utils/dinheiro";

const TEMAS = [
  { id: "auto", texto: "Automático" },
  { id: "claro", texto: "Claro" },
  { id: "escuro", texto: "Escuro" },
];

const ModalAjustes = ({ show, onClose, config, onConfigurar, tela }) => {
  const suportaTela = wakeLockSuportado();

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Ajustes"
      footer={
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Pronto
        </button>
      }
    >
      <div className="modal-field">
        <label htmlFor="orcamento">Orçamento da compra</label>
        <div className="price-box price-box--campo">
          <span className="price-currency">R$</span>
          <input
            id="orcamento"
            type="tel"
            inputMode="numeric"
            value={
              config.orcamento
                ? formatarCentavosSemSimbolo(config.orcamento)
                : ""
            }
            onChange={(e) =>
              onConfigurar({ orcamento: centavosDeDigitos(e.target.value) })
            }
            placeholder="0,00"
            autoComplete="off"
          />
          {config.orcamento > 0 && (
            <button
              type="button"
              className="button-reset price-limpar"
              onClick={() => onConfigurar({ orcamento: 0 })}
              aria-label="Remover orçamento"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
        <small className="field-ajuda">
          O total fica amarelo perto do limite (80%) e vermelho ao passar dele.
        </small>
      </div>

      <div className="modal-field">
        <span className="modal-field-label" id="rotulo-tema">
          Tema
        </span>
        <div
          className="segmented segmented--compacto"
          role="radiogroup"
          aria-labelledby="rotulo-tema"
        >
          {TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={config.tema === t.id}
              className={`seg-btn${config.tema === t.id ? " is-active" : ""}`}
              onClick={() => onConfigurar({ tema: t.id })}
            >
              {t.texto}
            </button>
          ))}
        </div>
      </div>

      <label className={`check-row${suportaTela ? "" : " is-disabled"}`}>
        <input
          type="checkbox"
          checked={config.telaLigada}
          disabled={!suportaTela}
          onChange={(e) => onConfigurar({ telaLigada: e.target.checked })}
        />
        <span>
          Manter a tela ligada
          <small className={tela.recusado ? "field-erro" : undefined}>
            {!suportaTela
              ? "Seu navegador não permite manter a tela ligada."
              : !config.telaLigada
                ? "Útil no mercado, para a tela não apagar entre um item e outro."
                : tela.recusado
                  ? "O navegador recusou o pedido (modo economia de bateria?). Tente de novo com o app aberto."
                  : tela.bloqueado
                    ? "Ativo: a tela não vai apagar enquanto o app estiver aberto."
                    : "Ativando…"}
          </small>
        </span>
      </label>
    </Modal>
  );
};

export default ModalAjustes;
