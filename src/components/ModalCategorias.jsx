import { useState } from "react";
import Modal from "./Modal";
import { normalizarTexto } from "../utils/texto";

const ModalCategorias = ({ show, onClose, categorias, produtos, acoes }) => {
  const [nova, setNova] = useState("");
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");

  const existe = (nome, ignorarId) =>
    categorias.some(
      (c) =>
        c.id !== ignorarId && normalizarTexto(c.nome) === normalizarTexto(nome)
    );

  const contagem = (id) => produtos.filter((p) => p.categoria === id).length;

  const adicionar = (e) => {
    e.preventDefault();
    if (normalizarTexto(nova) && !existe(nova)) {
      acoes.adicionarCategoria(nova);
      setNova("");
    }
  };

  const salvarEdicao = (e) => {
    e.preventDefault();
    if (normalizarTexto(nomeEditado) && !existe(nomeEditado, editando)) {
      acoes.renomearCategoria(editando, nomeEditado);
    }
    setEditando(null);
  };

  const novaDuplicada = normalizarTexto(nova) && existe(nova);

  return (
    <Modal show={show} onClose={onClose} title="Categorias">
      <p className="modal-text modal-text--sutil">
        A ordem aqui é a ordem da lista — dá para seguir os corredores do seu
        mercado.
      </p>
      <ul className="cat-gerenciar">
        {categorias.map((c, i) => {
          const qtd = contagem(c.id);
          return (
            <li key={c.id}>
              {editando === c.id ? (
                <form className="cat-gerenciar-form" onSubmit={salvarEdicao}>
                  <input
                    className="field-input"
                    value={nomeEditado}
                    onChange={(e) => setNomeEditado(e.target.value)}
                    aria-label={`Novo nome para ${c.nome}`}
                    autoFocus
                    maxLength={30}
                  />
                  <button type="submit" className="btn btn--primary btn--sm">
                    OK
                  </button>
                </form>
              ) : (
                <>
                  <span className="cat-gerenciar-nome">
                    {c.nome}
                    <small>{qtd} produto(s)</small>
                  </span>
                  <div className="cat-gerenciar-acoes">
                    <button
                      type="button"
                      className="button-reset"
                      onClick={() => acoes.moverCategoria(c.id, -1)}
                      disabled={i === 0}
                      aria-label={`Subir ${c.nome}`}
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="button-reset"
                      onClick={() => acoes.moverCategoria(c.id, 1)}
                      disabled={i === categorias.length - 1}
                      aria-label={`Descer ${c.nome}`}
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
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
                    <button
                      type="button"
                      className="button-reset"
                      onClick={() => acoes.excluirCategoria(c.id)}
                      disabled={qtd > 0 || categorias.length <= 1}
                      title={
                        qtd > 0
                          ? "Mova ou exclua os produtos antes de excluir a categoria"
                          : undefined
                      }
                      aria-label={`Excluir ${c.nome}`}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <form className="cat-gerenciar-form" onSubmit={adicionar}>
        <input
          className="field-input"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          placeholder="Nova categoria"
          aria-label="Nome da nova categoria"
          maxLength={30}
        />
        <button
          type="submit"
          className="btn btn--primary btn--sm"
          disabled={!normalizarTexto(nova) || novaDuplicada}
        >
          Adicionar
        </button>
      </form>
      {novaDuplicada && (
        <div className="field-erro" role="alert">
          Já existe uma categoria com esse nome.
        </div>
      )}
    </Modal>
  );
};

export default ModalCategorias;
