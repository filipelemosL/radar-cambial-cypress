# Radar Cambial — desafio técnico Cypress Fullstack Jr

Este repositório é um desafio técnico para uma pessoa desenvolvedora **Cypress Fullstack Jr**. O front-end e os desafios foram gerados por IA com o objetivo de propor um laboratório prático que desafie e contemple as principais habilidades esperadas para a função.

O projeto simula um painel de cotações cambiais com login, filtros, busca, ordenação, lista pessoal e histórico. A interface é React/Vite, a API local é Express e os dados de mercado usam a Frankfurter API, com dados de contingência quando necessário. As credenciais e o token são fictícios e o endpoint de reset é exclusivo da API local de laboratório. Todos existem apenas para facilitar cenários de teste e não representam mecanismos de produção.

## Escopo do desafio: níveis 0 a 6

Os requisitos deste desafio vão **somente do nível 0 ao nível 6**. Eles estão organizados para desenvolver os seguintes conjuntos de habilidades:

| Nível | Conjunto de skills abordado |
| --- | --- |
| 0 | Preparação do ambiente, scripts npm, configuração do Cypress e estrutura de specs. |
| 1 | Navegação, seletores estáveis, conteúdo e assertions básicas. |
| 2 | Interações de usuário, formulários, filtros, busca, ordenação e validação de estado. |
| 3 | Organização de suítes, hooks, aliases e independência entre cenários. |
| 4 | Testes de integração com rede: `cy.intercept()`, fixtures, atrasos, erros e contratos HTTP. |
| 5 | Testes de API, autenticação, dados previsíveis, preparação de estado e `cy.session()`. |
| 6 | Reutilização e manutenção: custom commands, seletores compartilhados e TypeScript. |

## Pré-requisitos

- Node.js
- npm

## Como rodar o projeto

Instale as dependências e inicie a API e o front-end:

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173` e use as credenciais abaixo:

```text
E-mail: analista@radarcambial.dev
Senha: cypress123
```

## Como iniciar o Cypress

Com o projeto em execução em outro terminal:

```bash
npm run cy:open
```

Para executar os testes E2E sem a interface do Cypress:

```bash
npm run cy:run
```

Consulte o backlog completo em [requisitos-cypress-progressivos.md](./requisitos-cypress-progressivos.md). O spec do painel está em [04-dashboard.cy.ts](./cypress/e2e/04-dashboard.cy.ts).

## Rotas da aplicação

```text
/login
  POST /api/auth/login
       ↓
/dashboard
  GET /api/market/quotes
  GET /api/market/history
  GET/POST/DELETE /api/watchlist
  POST /api/test/reset  (exclusivo do laboratório)
```

## Seletores relevantes

Os atributos `data-cy` são contratos estáveis para os testes. Alguns dos principais são:

- Login: `email`, `password`, `submit-login`, `error`.
- Dashboard: `market-base`, `currency-EUR`, `apply-filters`, `quote-search`, `sort-quotes`, `quote-row`.
- Lista e histórico: `add-watchlist`, `watchlist-item`, `watchlist-remove`, `view-history`, `history-modal`.
