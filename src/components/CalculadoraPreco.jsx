import { useMemo, useState } from "react";
import Modal from "./Modal";
import {
  MAX_OPCOES,
  MIN_OPCOES,
  ROTULOS_OPCOES,
  UNIDADES,
  compararOpcoes,
  formatPrecoMascara,
  opcaoVazia,
} from "../utils/CalculadoraPreco";
import { formatarCentavos } from "../utils/dinheiro";
import { ordenarPorNome } from "../utils/ProdutosIniciais";

const novasOpcoes = () => [opcaoVazia(), opcaoVazia()];

const CalculadoraPreco = ({
  show,
  onClose,
  produtos,
  alvoId,
  onMudarAlvo,
  onUsarPreco,
}) => {
  const [opcoes, setOpcoes] = useState(novasOpcoes);

  const atualizarOpcao = (indice, campo, valor) => {
    setOpcoes((atual) =>
      atual.map((opcao, i) =>
        i === indice
          ? {
              ...opcao,
              [campo]: campo === "preco" ? formatPrecoMascara(valor) : valor,
            }
          : opcao
      )
    );
  };

  const adicionarOpcao = () =>
    setOpcoes((atual) =>
      atual.length < MAX_OPCOES ? [...atual, opcaoVazia()] : atual
    );

  const removerOpcao = (indice) =>
    setOpcoes((atual) =>
      atual.length > MIN_OPCOES ? atual.filter((_, i) => i !== indice) : atual
    );

  const limpar = () => setOpcoes(novasOpcoes());

  const resultado = compararOpcoes(opcoes);
  const produtosOrdenados = useMemo(() => ordenarPorNome(produtos), [produtos]);
  const alvo = produtos.find((p) => p.id === alvoId);

  const usarPreco = () => {
    if (alvo && resultado?.tipo === "vencedora") {
      onUsarPreco(alvo, resultado.precoVencedora);
    }
  };

  const cardOpcao = (opcao, indice) => {
    const rotulo = ROTULOS_OPCOES[indice];
    const vencedora =
      resultado?.tipo === "vencedora" && resultado.vencedora === rotulo;
    const empatada =
      resultado?.tipo === "empate" && resultado.empatadas.includes(rotulo);
    return (
      <div
        key={rotulo}
        className={`calc-opcao${vencedora ? " is-vencedora" : ""}${
          empatada ? " is-empatada" : ""
        }`}
      >
        <div className="calc-opcao-titulo">
          Opção {rotulo}
          {vencedora && <span className="calc-selo">Compensa</span>}
          {empatada && (
            <span className="calc-selo calc-selo--empate">Empate</span>
          )}
          {opcoes.length > MIN_OPCOES && (
            <button
              type="button"
              className="calc-remover button-reset"
              onClick={() => removerOpcao(indice)}
              aria-label={`Remover opção ${rotulo}`}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        <div className="calc-linha">
          <input
            className="field-input calc-quantidade"
            type="text"
            inputMode="decimal"
            placeholder="Qtd."
            aria-label={`Quantidade da opção ${rotulo}`}
            value={opcao.quantidade}
            onChange={(e) =>
              atualizarOpcao(indice, "quantidade", e.target.value)
            }
            autoComplete="off"
          />
          <select
            className="field-input calc-unidade"
            aria-label={`Unidade da opção ${rotulo}`}
            value={opcao.unidade}
            onChange={(e) => atualizarOpcao(indice, "unidade", e.target.value)}
          >
            {Object.keys(UNIDADES).map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
        </div>
        <label className="calc-pacotes">
          <span>×</span>
          <input
            className="field-input"
            type="text"
            inputMode="numeric"
            placeholder="1"
            aria-label={`Embalagens na opção ${rotulo}`}
            value={opcao.pacotes}
            onChange={(e) =>
              atualizarOpcao(
                indice,
                "pacotes",
                e.target.value.replace(/\D/g, "")
              )
            }
            autoComplete="off"
          />
          <span>emb.</span>
        </label>
        <input
          className="field-input"
          type="text"
          inputMode="numeric"
          placeholder="R$ 0,00"
          aria-label={`Preço da opção ${rotulo}`}
          value={opcao.preco}
          onChange={(e) => atualizarOpcao(indice, "preco", e.target.value)}
          autoComplete="off"
        />
        {resultado?.porUnidade?.[rotulo] && (
          <div className="calc-por-unidade">{resultado.porUnidade[rotulo]}</div>
        )}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      className="modal-card--largo"
      title={
        alvo ? `Qual compensa mais? · ${alvo.nome}` : "Qual compensa mais?"
      }
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={limpar}>
            Limpar
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <div className="calc-opcoes">{opcoes.map(cardOpcao)}</div>

      {opcoes.length < MAX_OPCOES && (
        <button
          type="button"
          className="calc-adicionar button-reset"
          onClick={adicionarOpcao}
        >
          <i className="bi bi-plus-lg"></i> Adicionar opção
        </button>
      )}

      <div
        className={`calc-resultado${
          resultado?.tipo === "incompativel" ? " is-erro" : ""
        }`}
        aria-live="polite"
      >
        {resultado
          ? resultado.explicacao
          : "Informe a quantidade e o preço de pelo menos duas opções para comparar pelo preço por kg, L ou unidade. Use “emb.” para fardos e kits (ex.: 6 × 350 ml)."}
      </div>

      {resultado?.tipo === "vencedora" && (
        <div className="calc-usar">
          <label htmlFor="calc-produto">Usar o preço na lista</label>
          <div className="calc-usar-linha">
            <select
              id="calc-produto"
              className="field-input"
              value={alvoId || ""}
              onChange={(e) => onMudarAlvo(e.target.value || null)}
            >
              <option value="">Escolha o produto…</option>
              {produtosOrdenados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!alvo}
              onClick={usarPreco}
            >
              Usar {formatarCentavos(resultado.precoVencedora)}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CalculadoraPreco;
