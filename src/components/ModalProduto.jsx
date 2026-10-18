import { useState } from "react";
import Modal from "./Modal";
import { normalizarTexto } from "../utils/texto";

const TEXTOS_PADRAO = { item: "produto", grupo: "Categoria" };

// Formulário de inclusão/edição. O componente pai deve montá-lo com uma `key`
// diferente a cada abertura, para que o formulário comece do zero.
// `duplicadoPorCategoria`: o mesmo nome pode existir em grupos diferentes
// (no modo viagem cada pessoa tem a sua "Camiseta").
const ModalProduto = ({
  show,
  produto,
  categorias,
  produtos,
  categoriaInicial,
  onSalvar,
  onClose,
  textos = TEXTOS_PADRAO,
  duplicadoPorCategoria = false,
}) => {
  const Item = textos.item.charAt(0).toUpperCase() + textos.item.slice(1);
  const editando = Boolean(produto);
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [categoria, setCategoria] = useState(
    produto?.categoria ?? categoriaInicial ?? categorias[0]?.id ?? ""
  );
  const [manterNoReset, setManterNoReset] = useState(
    produto?.manterNoReset ?? false
  );
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const nomeNormalizado = normalizarTexto(nome);
  const duplicado = nomeNormalizado
    ? produtos.find(
        (p) =>
          p.id !== produto?.id &&
          normalizarTexto(p.nome) === nomeNormalizado &&
          (!duplicadoPorCategoria || p.categoria === categoria)
      )
    : null;
  const nomeCategoriaDuplicado = duplicado
    ? categorias.find((c) => c.id === duplicado.categoria)?.nome
    : "";

  const erroNome = tentouSalvar && !nomeNormalizado;
  const podeSalvar = nomeNormalizado && categoria && !duplicado;

  const salvar = (e) => {
    e.preventDefault();
    setTentouSalvar(true);
    if (podeSalvar) {
      onSalvar({ nome, categoria, manterNoReset });
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={editando ? `Editar ${textos.item}` : `Incluir novo ${textos.item}`}
      footer={
        <>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-produto"
            className="btn btn--primary"
            disabled={Boolean(duplicado)}
          >
            {editando ? "Atualizar" : "Adicionar"}
          </button>
        </>
      }
    >
      <form id="form-produto" onSubmit={salvar} noValidate>
        <div className="modal-field">
          <label htmlFor="nome-produto">{Item}</label>
          <input
            className={`field-input${erroNome ? " is-invalid" : ""}`}
            type="text"
            id="nome-produto"
            onChange={(e) => setNome(e.target.value)}
            value={nome}
            placeholder={`Nome do ${textos.item}`}
            autoComplete="off"
            autoFocus
            maxLength={60}
          />
          {erroNome && (
            <div className="field-erro" role="alert">
              Informe o nome do {textos.item}.
            </div>
          )}
          {duplicado && (
            <div className="field-erro" role="alert">
              {duplicadoPorCategoria
                ? `${duplicado.nome} já está na lista de ${nomeCategoriaDuplicado}.`
                : `O ${textos.item} ${duplicado.nome} já existe na lista na seção ${nomeCategoriaDuplicado}.`}
            </div>
          )}
        </div>

        <div className="modal-field">
          <span className="modal-field-label" id="rotulo-categoria">
            {textos.grupo}
          </span>
          <div
            className="cat-choice"
            role="radiogroup"
            aria-labelledby="rotulo-categoria"
          >
            {categorias.map((c) => (
              <label
                key={c.id}
                className={`cat-pill${categoria === c.id ? " is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="categoria-produto"
                  value={c.id}
                  checked={categoria === c.id}
                  onChange={() => setCategoria(c.id)}
                />
                {c.nome}
              </label>
            ))}
          </div>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            onChange={(e) => setManterNoReset(e.target.checked)}
            checked={manterNoReset}
          />
          <span>
            Manter na lista ao resetar
            <small>Itens marcados continuam na lista depois de um reset.</small>
          </span>
        </label>
      </form>
    </Modal>
  );
};

export default ModalProduto;
