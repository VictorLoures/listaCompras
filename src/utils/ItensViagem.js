import { novoProduto } from "./ProdutosIniciais";
import { criarId, normalizarTexto } from "./texto";

// Grupo fixo para o que é da viagem e não de uma pessoa (não pode ser removido).
export const GRUPO_GERAL = "geral";

export const PESSOAS_INICIAIS = ["Victor", "Erica", "Helena", "Anderson"];

// Itens compartilhados pela família. Baseados nos checklists de viagem mais
// comuns (documentos, saúde, eletrônicos e extras).
const ITENS_GERAIS = [
  "Documentos (RG/CNH)",
  "Passagens e reservas",
  "Cartões e dinheiro",
  "Carregador portátil",
  "Adaptador de tomada",
  "Protetor solar",
  "Repelente",
  "Kit de primeiros socorros",
  "Álcool em gel",
  "Lenços umedecidos",
  "Guarda-chuva",
  "Sacola para roupa suja",
  "Cadeado de mala",
  "Garrafa de água",
  "Lanche para a viagem",
];

// Itens que cada pessoa leva. Escova/pasta de dente e carregador são os itens
// mais esquecidos em viagens, por isso estão em todas as listas.
const ITENS_PESSOAIS = [
  "Camiseta",
  "Calça",
  "Bermuda / short",
  "Roupa íntima",
  "Meias",
  "Pijama",
  "Casaco",
  "Roupa de banho",
  "Tênis",
  "Chinelo",
  "Escova de dente",
  "Pasta de dente",
  "Fio dental",
  "Desodorante",
  "Shampoo",
  "Condicionador",
  "Sabonete",
  "Pente / escova de cabelo",
  "Toalha",
  "Carregador de celular",
  "Fone de ouvido",
  "Óculos",
  "Boné / chapéu",
  "Remédios de uso pessoal",
];

const slug = (texto) => normalizarTexto(texto).replace(/[^a-z0-9]+/g, "-");

const criarItens = (nomes, grupoId, gerarId) =>
  nomes.map((nome) =>
    novoProduto({
      id: gerarId(nome),
      nome,
      categoria: grupoId,
      original: true,
    })
  );

// Itens sugeridos para uma pessoa nova (ids aleatórios).
export const criarItensPessoa = (pessoaId) =>
  criarItens(ITENS_PESSOAIS, pessoaId, () => criarId("item"));

// Estado inicial do modo viagem: grupo Geral + as pessoas, com ids estáveis.
export const criarInicialViagem = () => {
  const pessoas = PESSOAS_INICIAIS.map((nome) => ({ id: slug(nome), nome }));
  return {
    categorias: [{ id: GRUPO_GERAL, nome: "Geral", fixa: true }, ...pessoas],
    produtos: [
      ...criarItens(
        ITENS_GERAIS,
        GRUPO_GERAL,
        (n) => `viagem-geral-${slug(n)}`
      ),
      ...pessoas.flatMap((p) =>
        criarItens(ITENS_PESSOAIS, p.id, (n) => `viagem-${p.id}-${slug(n)}`)
      ),
    ],
  };
};
