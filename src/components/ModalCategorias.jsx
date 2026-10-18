import { useState } from "react";
import Modal from "./Modal";
import { normalizarTexto } from "../utils/texto";

// Gerencia os grupos da lista. No modo compras as categorias são fixas e só
// podem ser renomeadas; no modo viagem dá para incluir e remover pessoas
// (`onIncluir`/`onExcluir`). Grupos com `fixa` nunca são removidos.
const ModalCategorias = ({
  show,
  onClose,
  categorias,
  produtos,
  acoes,
  titulo = "Categorias",
  rotuloNovo = "Novo grupo",
  rotuloContagem = "produto(s)",
  onIncluir,
  onExcluir,
}) => {
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [novo, setNovo] = useState("");

  const existe = (nome, ignorarId) =>
    categorias.some(
      (c) =>
        c.id !== ignorarId && normalizarTexto(c.nome) === normalizarTexto(nome)
    );

  const duplicado = editando !== null && existe(nomeEditado, editando);
  const podeSalvar = normalizarTexto(nomeEditado) && !duplicado;
  const novoDuplicado = normalizarTexto(novo) && existe(novo);
  const podeIncluir = normalizarTexto(novo) && !novoDuplicado;
  const removiveis = categorias.filter((c) => !c.fixa).length;

  const contagem = (id) => produtos.filter((p) => p.categoria === id).length;

  const salvarEdicao = (e) => {
    e.preventDefault();
    if (!podeSalvar) return;
    acoes.renomearCategoria(editando, nomeEditado);
    setEditando(null);
  };

  const incluir = (e) => {
    e.preventDefault();
    if (!podeIncluir) return;
    onIncluir(novo);
    setNovo("");
  };

  return (
    <Modal show={show} onClose={onClose} title={titulo}>
      <ul className="cat-gerenciar">
        {categorias.map((c) => (
          <li key={c.id}>
            {editando === c.id ? (
              <form className="cat-gerenciar-form" onSubmit={salvarEdicao}>
                <input
                  className={`field-input${duplicado ? " is-invalid" : ""}`}
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  aria-label={`Novo nome para ${c.nome}`}
                  autoFocus
                  maxLength={30}
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={!podeSalvar}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <span className="cat-gerenciar-nome">
                  {c.nome}
                  <small>
                    {contagem(c.id)} {rotuloContagem}
                  </small>
                </span>
                <div className="cat-gerenciar-acoes">
                  <button
                    type="button"
                    className="button-reset"
                    onClick={() => {
                      setEditando(c.id);
                      setNomeEditado(c.nome);
                    }}
                    aria-label={`Renomear ${c.nome}`}
                  >
                    <i className="bi bi-pen"></i>
                  </button>
                  {onExcluir && !c.fixa && (
                    <button
                      type="button"
                      className="button-reset"
                      onClick={() => onExcluir(c)}
                      disabled={removiveis <= 1}
                      title={
                        removiveis <= 1
                          ? "A lista precisa de pelo menos uma pessoa"
                          : undefined
                      }
                      aria-label={`Remover ${c.nome}`}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {duplicado && (
        <div className="field-erro" role="alert">
          Já existe um grupo com esse nome.
        </div>
      )}
      {onIncluir && (
        <>
          <form className="cat-gerenciar-form" onSubmit={incluir}>
            <input
              className="field-input"
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              placeholder={rotuloNovo}
              aria-label={rotuloNovo}
              maxLength={30}
            />
            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={!podeIncluir}
            >
              Incluir
            </button>
          </form>
          {novoDuplicado && (
            <div className="field-erro" role="alert">
              Já existe um grupo com esse nome.
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default ModalCategorias;
