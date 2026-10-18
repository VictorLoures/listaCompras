import { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import CalculadoraPreco from "./components/CalculadoraPreco";
import ListaCategoria from "./components/ListaCategoria";
import MenuAcoes from "./components/MenuAcoes";
import ModalCategorias from "./components/ModalCategorias";
import ModalConfirmacao from "./components/ModalConfirmacao";
import ModalProduto from "./components/ModalProduto";
import ResumoTotal from "./components/ResumoTotal";
import { avisarComDesfazer } from "./components/ToastDesfazer";
import {
  LISTA_VIAGEM,
  useLista,
  useListaCompras,
} from "./hooks/useListaCompras";
import { useTelaLigada, wakeLockSuportado } from "./hooks/useTelaLigada";
import { precoEfetivo } from "./state/lista";
import { gerarTextoLista, linkWhatsApp } from "./utils/compartilhar";
import { formatarCentavos } from "./utils/dinheiro";
import { lerModo, salvarModo } from "./utils/persistencia";
import { ordenarPorNome } from "./utils/ProdutosIniciais";
import { normalizarTexto } from "./utils/texto";

// Diferenças de texto e comportamento entre os dois modos do app.
const MODOS = {
  compras: {
    id: "compras",
    rotulo: "Compras",
    icone: "bi-cart3",
    titulo: "Minhas compras",
    comPreco: true,
    rotuloPego: "Já pegou",
    filtroPego: "Pegos",
    textosProduto: { item: "produto", grupo: "Categoria" },
    duplicadoPorCategoria: false,
    tituloTexto: "🛒 *Lista de compras*",
    grupos: {
      menu: "Renomear categorias",
      icone: "bi-tags",
      titulo: "Categorias",
      contagem: "produto(s)",
    },
    resetOriginalDetalhe:
      "Remove os produtos que você criou e volta os nomes das categorias.",
  },
  viagem: {
    id: "viagem",
    rotulo: "Viagem",
    icone: "bi-luggage",
    titulo: "Minha viagem",
    comPreco: false,
    rotuloPego: "Já está na mala",
    filtroPego: "Na mala",
    textosProduto: { item: "item", grupo: "Pessoa" },
    duplicadoPorCategoria: true,
    tituloTexto: "🧳 *Lista de viagem*",
    grupos: {
      menu: "Pessoas",
      icone: "bi-people",
      titulo: "Pessoas",
      contagem: "item(ns)",
      novo: "Nova pessoa",
    },
    resetOriginalDetalhe:
      "Volta às pessoas e aos itens sugeridos; remove quem e o que você incluiu.",
  },
};

function App() {
  const listaCompras = useListaCompras();
  const listaViagem = useLista(LISTA_VIAGEM);

  const [modoId, setModoId] = useState(lerModo);
  const modo = MODOS[modoId];
  const lista = modoId === "viagem" ? listaViagem : listaCompras;
  const { produtos, categorias, config, resumo, acoes, comDesfazer } = lista;

  // Qual modal está aberto (só um por vez) e os dados de contexto de cada um.
  const [modal, setModal] = useState(null);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [grupoParaExcluir, setGrupoParaExcluir] = useState(null);
  const [resetOriginal, setResetOriginal] = useState(false);
  const [alvoCalculadora, setAlvoCalculadora] = useState(null);
  const [aberturasForm, setAberturasForm] = useState(0);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [showVoltarTopo, setShowVoltarTopo] = useState(false);

  const fecharModal = useCallback(() => setModal(null), []);

  const trocarModo = (novo) => {
    if (novo === modoId) return;
    setModoId(novo);
    salvarModo(novo);
    setBusca("");
    setFiltro("todos");
    setModal(null);
    window.scrollTo({ top: 0 });
  };

  // "Manter a tela ligada" vale para o app todo (fica na config de compras).
  const telaLigada = listaCompras.config.telaLigada;
  const configurarTela = listaCompras.acoes.configurar;
  const tela = useTelaLigada(telaLigada);

  // Se o navegador recusar manter a tela ligada, avisa e desliga a opção.
  useEffect(() => {
    if (telaLigada && tela.recusado) {
      toast.error("O navegador não permitiu manter a tela ligada.");
      configurarTela({ telaLigada: false });
    }
  }, [telaLigada, tela.recusado, configurarTela]);

  useEffect(() => {
    const onScroll = () => setShowVoltarTopo(window.scrollY > 250);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visiveisPorCategoria = useMemo(() => {
    const q = normalizarTexto(busca);
    const visivel = (p) => {
      if (q && !normalizarTexto(p.nome).includes(q)) return false;
      if (config.ocultar && p.qte === 0) return false;
      if (filtro === "faltam" && p.pego) return false;
      if (filtro === "pegos" && !p.pego) return false;
      return true;
    };
    return categorias.map((categoria) => ({
      categoria,
      produtos: ordenarPorNome(
        produtos.filter((p) => p.categoria === categoria.id && visivel(p))
      ),
    }));
  }, [produtos, categorias, busca, filtro, config.ocultar]);

  const semItens = visiveisPorCategoria.every((g) => g.produtos.length === 0);

  // ---------- Produtos ----------
  const abrirFormulario = useCallback((produto = null) => {
    setProdutoEmEdicao(produto);
    setAberturasForm((n) => n + 1);
    setModal("produto");
  }, []);

  const salvarProduto = (dados) => {
    if (produtoEmEdicao) {
      acoes.editarProduto(produtoEmEdicao.id, dados);
      toast.success(modo.comPreco ? "Produto atualizado" : "Item atualizado");
    } else {
      acoes.adicionarProduto(dados);
      toast.success(
        modo.comPreco ? "Produto incluído com sucesso" : "Item incluído"
      );
      // Limpa a busca/filtro para o item novo aparecer.
      setBusca("");
      setFiltro("todos");
    }
    fecharModal();
  };

  const onExcluir = useCallback((produto) => {
    setProdutoParaExcluir(produto);
    setModal("excluir");
  }, []);

  const onComparar = useCallback((produto) => {
    setAlvoCalculadora(produto.id);
    setModal("calculadora");
  }, []);

  const confirmarExclusao = () => {
    const { desfazer } = comDesfazer(() =>
      acoes.excluirProduto(produtoParaExcluir.id)
    );
    avisarComDesfazer(`${produtoParaExcluir.nome} excluído`, desfazer);
    setProdutoParaExcluir(null);
    fecharModal();
  };

  // ---------- Pessoas (modo viagem) ----------
  const incluirPessoa = (nome) => {
    acoes.adicionarCategoria(nome);
    toast.success(`${nome.trim()} incluído(a) com a lista sugerida`);
  };

  const confirmarExclusaoGrupo = () => {
    const { desfazer } = comDesfazer(() =>
      acoes.excluirCategoria(grupoParaExcluir.id)
    );
    avisarComDesfazer(`${grupoParaExcluir.nome} removido(a)`, desfazer);
    setGrupoParaExcluir(null);
    setModal("categorias");
  };

  const itensDoGrupo = grupoParaExcluir
    ? produtos.filter((p) => p.categoria === grupoParaExcluir.id).length
    : 0;

  // ---------- Reset / finalizar ----------
  const confirmarReset = () => {
    const { desfazer } = comDesfazer(() => acoes.resetar(resetOriginal));
    avisarComDesfazer("Lista resetada", desfazer);
    setResetOriginal(false);
    setBusca("");
    setFiltro("todos");
    acoes.configurar({ ocultar: false });
    fecharModal();
  };

  const confirmarFinalizar = () => {
    const { desfazer } = comDesfazer(() => acoes.finalizarCompra());
    avisarComDesfazer("Compra finalizada", desfazer);
    setFiltro("todos");
    fecharModal();
  };

  // ---------- Compartilhar ----------
  const textoLista = () =>
    gerarTextoLista(produtos, categorias, {
      total: resumo.total,
      titulo: modo.tituloTexto,
      comPreco: modo.comPreco,
    });

  const copiarLista = async () => {
    try {
      await navigator.clipboard.writeText(textoLista());
      toast.success("Lista copiada! É só colar na conversa.");
    } catch {
      toast.error("Não foi possível copiar a lista.");
    }
  };

  const compartilharLista = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: modo.titulo, text: textoLista() });
        return;
      } catch (erro) {
        if (erro?.name === "AbortError") return;
      }
    }
    copiarLista();
  };

  const enviarWhatsApp = () => {
    window.open(linkWhatsApp(textoLista()), "_blank", "noopener");
  };

  // ---------- Calculadora (modo compras) ----------
  const usarPrecoDaCalculadora = (produto, preco) => {
    acoes.definirPreco(produto.id, preco);
    toast.success(
      `${produto.nome}: preço definido em ${formatarCentavos(preco)}`
    );
    fecharModal();
  };

  const pegos = produtos.filter((p) => p.pego);
  const totalPegos = pegos.reduce((s, p) => s + p.qte * precoEfetivo(p), 0);
  const faltaram = produtos.filter((p) => p.qte > 0 && !p.pego).length;

  const itensMenu = [
    modo.comPreco && {
      id: "finalizar",
      icone: "bi-bag-check",
      texto: "Finalizar compra",
      detalhe: pegos.length
        ? `Tira ${pegos.length} item(ns) pego(s) da lista`
        : "Marque os itens pegos primeiro",
      desabilitado: pegos.length === 0,
      onClick: () => setModal("finalizar"),
    },
    {
      id: "whatsapp",
      icone: "bi-whatsapp",
      texto: "Enviar pelo WhatsApp",
      onClick: enviarWhatsApp,
    },
    {
      id: "compartilhar",
      icone: "bi-share",
      texto: "Compartilhar / copiar lista",
      onClick: compartilharLista,
    },
    {
      id: "grupos",
      icone: modo.grupos.icone,
      texto: modo.grupos.menu,
      detalhe: categorias.map((c) => c.nome).join(", "),
      onClick: () => setModal("categorias"),
    },
    {
      id: "tela",
      icone: telaLigada ? "bi-brightness-high-fill" : "bi-brightness-high",
      texto: telaLigada
        ? "Desligar tela sempre ligada"
        : "Manter a tela ligada",
      detalhe: !wakeLockSuportado()
        ? "Não disponível neste navegador"
        : telaLigada
          ? "A tela não apaga enquanto o app estiver aberto"
          : "Para a tela não apagar enquanto usa a lista",
      desabilitado: !wakeLockSuportado(),
      onClick: () => configurarTela({ telaLigada: !telaLigada }),
    },
    {
      id: "resetar",
      icone: "bi-arrow-clockwise",
      texto: "Resetar lista",
      perigo: true,
      onClick: () => setModal("resetar"),
    },
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <ToastContainer
        autoClose={3000}
        position="bottom-center"
        newestOnTop
        limit={2}
      />

      <ModalProduto
        key={`${modoId}-${aberturasForm}`}
        show={modal === "produto"}
        produto={produtoEmEdicao}
        categorias={categorias}
        produtos={produtos}
        onSalvar={salvarProduto}
        onClose={fecharModal}
        textos={modo.textosProduto}
        duplicadoPorCategoria={modo.duplicadoPorCategoria}
      />

      <ModalConfirmacao
        show={modal === "excluir"}
        titulo={`Excluir ${modo.textosProduto.item}`}
        textoConfirmar="Excluir"
        perigo
        onConfirmar={confirmarExclusao}
        onClose={fecharModal}
      >
        <p className="modal-text">
          Tem certeza que deseja excluir{" "}
          <strong>{produtoParaExcluir?.nome}</strong>?
        </p>
      </ModalConfirmacao>

      <ModalConfirmacao
        show={modal === "excluirGrupo"}
        titulo="Remover pessoa"
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarExclusaoGrupo}
        onClose={() => setModal("categorias")}
      >
        <p className="modal-text">
          Remover <strong>{grupoParaExcluir?.nome}</strong> da viagem? Os{" "}
          {itensDoGrupo} item(ns) da lista dele(a) também saem.
        </p>
      </ModalConfirmacao>

      <ModalConfirmacao
        show={modal === "resetar"}
        titulo="Resetar lista"
        textoConfirmar="Resetar"
        onConfirmar={confirmarReset}
        onClose={() => {
          setResetOriginal(false);
          fecharModal();
        }}
      >
        <p className="modal-text">
          {modo.comPreco
            ? "Quantidades, preços e marcações voltam a zero. O último preço de cada produto fica guardado como sugestão."
            : "Quantidades e marcações de mala voltam a zero."}
        </p>
        <label className="check-row">
          <input
            type="checkbox"
            onChange={(e) => setResetOriginal(e.target.checked)}
            checked={resetOriginal}
          />
          <span>
            Resetar para a lista original
            <small>{modo.resetOriginalDetalhe}</small>
          </span>
        </label>
      </ModalConfirmacao>

      <ModalConfirmacao
        show={modal === "finalizar"}
        titulo="Finalizar compra"
        textoConfirmar="Finalizar"
        onConfirmar={confirmarFinalizar}
        onClose={fecharModal}
      >
        <p className="modal-text">
          Os <strong>{pegos.length}</strong> itens pegos (
          {formatarCentavos(totalPegos)}) saem da lista. O preço pago fica
          guardado como sugestão para a próxima vez.
        </p>
        {faltaram > 0 && (
          <p className="modal-text modal-text--sutil">
            {faltaram} item(ns) que faltaram continuam na lista para a próxima
            compra.
          </p>
        )}
      </ModalConfirmacao>

      {modo.comPreco && (
        <CalculadoraPreco
          show={modal === "calculadora"}
          onClose={fecharModal}
          produtos={produtos}
          alvoId={alvoCalculadora}
          onMudarAlvo={setAlvoCalculadora}
          onUsarPreco={usarPrecoDaCalculadora}
        />
      )}

      <MenuAcoes
        show={modal === "menu"}
        onClose={fecharModal}
        itens={itensMenu}
      />

      <ModalCategorias
        key={modoId}
        show={modal === "categorias"}
        onClose={fecharModal}
        categorias={categorias}
        produtos={produtos}
        acoes={acoes}
        titulo={modo.grupos.titulo}
        rotuloContagem={modo.grupos.contagem}
        rotuloNovo={modo.grupos.novo}
        onIncluir={modo.comPreco ? undefined : incluirPessoa}
        onExcluir={
          modo.comPreco
            ? undefined
            : (grupo) => {
                setGrupoParaExcluir(grupo);
                setModal("excluirGrupo");
              }
        }
      />

      <div className="card">
        <header className="header">
          <div className="modo-switch" role="group" aria-label="Modo do app">
            {Object.values(MODOS).map((m) => (
              <button
                key={m.id}
                type="button"
                className={`modo-btn${modoId === m.id ? " is-active" : ""}`}
                onClick={() => trocarModo(m.id)}
                aria-pressed={modoId === m.id}
              >
                <i className={`bi ${m.icone}`} aria-hidden="true"></i>
                {m.rotulo}
              </button>
            ))}
          </div>

          <div className="header-top">
            <h1 className="header-title">{modo.titulo}</h1>
            <span className="header-count">
              {resumo.quantidadeItens}{" "}
              {resumo.quantidadeItens === 1 ? "item" : "itens"}
              {telaLigada && tela.bloqueado && (
                <i
                  className="bi bi-brightness-high header-tela"
                  title="Tela mantida ligada"
                  aria-label="Tela mantida ligada"
                ></i>
              )}
            </span>
          </div>

          <ResumoTotal resumo={resumo} comPreco={modo.comPreco} />

          <div className="header-actions">
            <div className="search">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                ></circle>
                <path
                  d="M21 21l-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                ></path>
              </svg>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar item"
                autoComplete="off"
                type="search"
              />
            </div>
            <button
              type="button"
              onClick={() => abrirFormulario()}
              className="action-btn action-btn--add"
              aria-label={`Incluir ${modo.textosProduto.item}`}
            >
              +
            </button>
            {modo.comPreco && (
              <button
                type="button"
                onClick={() => {
                  setAlvoCalculadora(null);
                  setModal("calculadora");
                }}
                className="action-btn action-btn--ghost"
                aria-label="Comparar preços"
              >
                <i className="bi bi-calculator"></i>
              </button>
            )}
            <button
              type="button"
              onClick={() => acoes.configurar({ ocultar: !config.ocultar })}
              className={`action-btn action-btn--ghost${
                config.ocultar ? " is-active" : ""
              }`}
              aria-label="Ocultar itens sem quantidade"
              aria-pressed={config.ocultar}
            >
              <i
                className={config.ocultar ? "bi bi-eye-slash" : "bi bi-eye"}
              ></i>
            </button>
            <button
              type="button"
              onClick={() => setModal("menu")}
              className="action-btn action-btn--ghost"
              aria-label="Mais ações"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
          </div>

          <div className="segmented" role="group" aria-label="Filtrar itens">
            {[
              { id: "todos", texto: "Todos" },
              { id: "faltam", texto: "Faltam" },
              { id: "pegos", texto: modo.filtroPego },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`seg-btn${filtro === f.id ? " is-active" : ""}`}
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
              >
                {f.texto}
              </button>
            ))}
          </div>
        </header>

        <main className="list">
          {semItens ? (
            <div className="empty-state">
              {busca
                ? `Nenhum item encontrado para “${busca}”.`
                : "Nenhum item por aqui."}
            </div>
          ) : (
            visiveisPorCategoria.map(({ categoria, produtos: itens }) => (
              <ListaCategoria
                key={categoria.id}
                categoria={categoria}
                produtos={itens}
                acoes={acoes}
                onEditar={abrirFormulario}
                onExcluir={onExcluir}
                onComparar={onComparar}
                comPreco={modo.comPreco}
                rotuloPego={modo.rotuloPego}
                rotuloComGrupo={modo.duplicadoPorCategoria}
              />
            ))
          )}
        </main>

        {showVoltarTopo && (
          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao topo"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
