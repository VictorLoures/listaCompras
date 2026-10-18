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
import { useListaCompras } from "./hooks/useListaCompras";
import { useTelaLigada, wakeLockSuportado } from "./hooks/useTelaLigada";
import { precoEfetivo } from "./state/lista";
import { gerarTextoLista, linkWhatsApp } from "./utils/compartilhar";
import { formatarCentavos } from "./utils/dinheiro";
import { ordenarPorNome } from "./utils/ProdutosIniciais";
import { normalizarTexto } from "./utils/texto";

const FILTROS = [
  { id: "todos", texto: "Todos" },
  { id: "faltam", texto: "Faltam" },
  { id: "pegos", texto: "Pegos" },
];

function App() {
  const { produtos, categorias, config, resumo, acoes, comDesfazer } =
    useListaCompras();

  // Qual modal está aberto (só um por vez) e os dados de contexto de cada um.
  const [modal, setModal] = useState(null);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [resetOriginal, setResetOriginal] = useState(false);
  const [alvoCalculadora, setAlvoCalculadora] = useState(null);
  const [aberturasForm, setAberturasForm] = useState(0);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [showVoltarTopo, setShowVoltarTopo] = useState(false);

  const fecharModal = useCallback(() => setModal(null), []);

  const tela = useTelaLigada(config.telaLigada);

  // Se o navegador recusar manter a tela ligada, avisa e desliga a opção.
  useEffect(() => {
    if (config.telaLigada && tela.recusado) {
      toast.error("O navegador não permitiu manter a tela ligada.");
      acoes.configurar({ telaLigada: false });
    }
  }, [config.telaLigada, tela.recusado, acoes]);

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
      toast.success("Produto atualizado");
    } else {
      acoes.adicionarProduto(dados);
      toast.success("Produto incluído com sucesso");
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
    gerarTextoLista(produtos, categorias, { total: resumo.total });

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
        await navigator.share({
          title: "Lista de compras",
          text: textoLista(),
        });
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

  // ---------- Calculadora ----------
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
    {
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
      id: "categorias",
      icone: "bi-tags",
      texto: "Renomear categorias",
      detalhe: categorias.map((c) => c.nome).join(", "),
      onClick: () => setModal("categorias"),
    },
    {
      id: "tela",
      icone: config.telaLigada
        ? "bi-brightness-high-fill"
        : "bi-brightness-high",
      texto: config.telaLigada
        ? "Desligar tela sempre ligada"
        : "Manter a tela ligada",
      detalhe: !wakeLockSuportado()
        ? "Não disponível neste navegador"
        : config.telaLigada
          ? "A tela não apaga enquanto o app estiver aberto"
          : "Para a tela não apagar durante a compra",
      desabilitado: !wakeLockSuportado(),
      onClick: () => acoes.configurar({ telaLigada: !config.telaLigada }),
    },
    {
      id: "resetar",
      icone: "bi-arrow-clockwise",
      texto: "Resetar lista",
      perigo: true,
      onClick: () => setModal("resetar"),
    },
  ];

  return (
    <div className="app-shell">
      <ToastContainer autoClose={3000} position="bottom-center" newestOnTop />

      <ModalProduto
        key={aberturasForm}
        show={modal === "produto"}
        produto={produtoEmEdicao}
        categorias={categorias}
        produtos={produtos}
        onSalvar={salvarProduto}
        onClose={fecharModal}
      />

      <ModalConfirmacao
        show={modal === "excluir"}
        titulo="Excluir produto"
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
        show={modal === "resetar"}
        titulo="Resetar produtos"
        textoConfirmar="Resetar"
        onConfirmar={confirmarReset}
        onClose={() => {
          setResetOriginal(false);
          fecharModal();
        }}
      >
        <p className="modal-text">
          Quantidades, preços e marcações voltam a zero. O último preço de cada
          produto fica guardado como sugestão.
        </p>
        <label className="check-row">
          <input
            type="checkbox"
            onChange={(e) => setResetOriginal(e.target.checked)}
            checked={resetOriginal}
          />
          <span>
            Resetar para a lista original
            <small>
              Remove os produtos que você criou e volta os nomes das categorias.
            </small>
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

      <CalculadoraPreco
        show={modal === "calculadora"}
        onClose={fecharModal}
        produtos={produtos}
        alvoId={alvoCalculadora}
        onMudarAlvo={setAlvoCalculadora}
        onUsarPreco={usarPrecoDaCalculadora}
      />

      <MenuAcoes
        show={modal === "menu"}
        onClose={fecharModal}
        itens={itensMenu}
      />

      <ModalCategorias
        show={modal === "categorias"}
        onClose={fecharModal}
        categorias={categorias}
        produtos={produtos}
        acoes={acoes}
      />

      <div className="card">
        <header className="header">
          <div className="header-top">
            <h1 className="header-title">Minhas compras</h1>
            <span className="header-count">
              {resumo.quantidadeItens} itens
              {config.telaLigada && tela.bloqueado && (
                <i
                  className="bi bi-brightness-high header-tela"
                  title="Tela mantida ligada"
                  aria-label="Tela mantida ligada"
                ></i>
              )}
            </span>
          </div>

          <ResumoTotal resumo={resumo} />

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
              aria-label="Incluir produto"
            >
              +
            </button>
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
            {FILTROS.map((f) => (
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
