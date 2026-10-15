<h1 align="center">🛒 Lista de Compras</h1>

<p align="center">
  Um app de lista de compras feito em React — adicione produtos, controle quantidades e preços,
  acompanhe o total estimado e o quanto você já colocou no carrinho.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/PWA-offline-2f9e5f" alt="PWA offline" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="https://lista-compras-psi.vercel.app/"><b>🔗 Acessar</b></a>
</p>

---

## 📸 Preview

<p align="center">
  <img src="docs/site.png" alt="Tela do app Lista de Compras" width="360" />
</p>

---

## ✨ Funcionalidades

**Lista**

- 🗂️ **Categorias personalizáveis** — crie, renomeie, exclua e reordene (ex.: na ordem dos corredores do seu mercado).
- ➕➖ **Quantidade e preço por item** — preço digitado em centavos (`0,01` → `0,13` → `1,35`) com total por linha.
- ✅ **Marcar como "pego"** — risca o item e alimenta o anel de progresso.
- 🔎 **Busca** sem acentos, **filtro** Todos / Faltam / Pegos e **ocultar zerados**.
- 📝 **Incluir, editar e excluir** qualquer produto (inclusive os padrão), com aviso de nome duplicado.
- ↩️ **Desfazer** exclusões, resets e compras finalizadas.

**Dinheiro**

- 💾 **Memória do último preço** — depois de um reset ou de finalizar a compra, o último preço pago fica como sugestão e entra no total estimado.
- 💰 **Orçamento** — barra de uso com aviso perto do limite (80%) e ao passar dele.
- 🧮 **Calculadora "qual compensa mais?"** — compara de 2 a 4 embalagens pelo preço por kg, L ou unidade, inclusive fardos (ex.: 6 × 350 ml), e aplica o preço vencedor direto no item da lista.
- 🧾 **Histórico de compras** — "Finalizar compra" guarda os itens pegos; veja gastos por mês e a variação de preço de cada produto.

**Uso no mercado**

- 📲 **PWA offline** — instalável e funciona sem internet depois da primeira visita.
- 🔆 **Manter a tela ligada** enquanto a lista está aberta (Screen Wake Lock).
- 💬 **Compartilhar** a lista pelo WhatsApp ou copiar como texto.
- 🌙 **Tema claro, escuro ou automático.**
- 📱 **Responsivo** — mobile-first, de 320px ao desktop.

---

## 🛠️ Tecnologias

- [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- CSS puro com variáveis de tema (design tokens, claro/escuro)
- [Bootstrap Icons](https://icons.getbootstrap.com/) (empacotados localmente, para funcionar offline)
- [React Toastify](https://fkhadra.github.io/react-toastify/) — notificações com "Desfazer"
- `localStorage` para persistência, com migração automática dos dados da versão anterior
- Service worker próprio (`public/sw.js`)
- [Vitest](https://vitest.dev/) + Testing Library, ESLint + Prettier

---

## 🚀 Como rodar localmente

Pré-requisitos: **Node.js** e **Yarn** (ou npm) instalados.

```bash
# clone o repositório
git clone https://github.com/VictorLoures/listaCompras.git
cd listaCompras

# instale as dependências
yarn install

# rode em modo desenvolvimento
yarn start
```

O app abre em [http://localhost:5173](http://localhost:5173).

---

## 📜 Scripts disponíveis

| Comando         | Descrição                                        |
| --------------- | ------------------------------------------------ |
| `yarn start`    | Roda o app em modo desenvolvimento (Vite)        |
| `yarn build`    | Gera a build de produção em `build/`             |
| `yarn preview`  | Serve a build de produção (com o service worker) |
| `yarn test`     | Executa os testes (Vitest, modo watch)           |
| `yarn lint`     | Verifica o código com ESLint                     |
| `yarn lint:fix` | Corrige problemas de lint automaticamente        |
| `yarn format`   | Formata o código com Prettier                    |

---

## 📁 Estrutura do projeto

```
listaCompras/
├── index.html                  # HTML base (Vite)
├── public/
│   ├── manifest.json           # Manifesto do PWA
│   └── sw.js                   # Service worker (offline)
├── src/
│   ├── main.jsx                # Entrada: monta o App e registra o service worker
│   ├── App.jsx                 # Layout e orquestração dos modais
│   ├── App.css                 # Estilos e tokens de tema
│   ├── components/             # Item, total/orçamento, modais, calculadora, histórico…
│   ├── hooks/
│   │   ├── useListaCompras.js  # Estado + persistência + desfazer
│   │   ├── useTelaLigada.js    # Screen Wake Lock
│   │   └── useTema.js          # Tema claro/escuro/automático
│   ├── state/lista.js          # Reducer puro com as regras de negócio
│   └── utils/                  # Dinheiro (centavos), persistência/migração,
│                               # calculadora, histórico, compartilhar, produtos iniciais
└── package.json
```

---

## 🧠 Como funciona

- Todo o estado (produtos, categorias, histórico e ajustes) fica em uma chave do `localStorage`
  (`listaCompras:v2`). Na primeira abertura, os dados da versão antiga são migrados automaticamente.
- Preços são guardados como **inteiros em centavos**, sem erro de arredondamento.
- As regras (reset, finalizar compra, categorias…) ficam em um reducer puro em `src/state/lista.js`,
  testado isoladamente.
- **Reset**: zera quantidades, preços e marcações; mantém só os produtos marcados como
  "manter na lista" e guarda o último preço pago como sugestão.
- **Finalizar compra**: os itens pegos vão para o histórico e saem da lista; o que faltou continua
  para a próxima compra.

---

## 👤 Autor

Feito por **Victor Loures**.
