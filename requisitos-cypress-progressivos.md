# Requisitos progressivos — Radar Cambial

Este é um desafio técnico para uma pessoa desenvolvedora **Cypress Fullstack Jr**. O front-end e os requisitos foram gerados por IA para criar cenários práticos que exercitam as principais skills da função: teste E2E, teste de API, manipulação de estado, interceptação de rede, autenticação e manutenção de uma suíte em TypeScript.


## Dados de demonstração

```text
E-mail: analista@radarcambial.dev
Senha: cypress123
```

## Skills desenvolvidas por nível

| Nível | Conjunto de skills |
| --- | --- |
| 0 | Ambiente local, scripts, configuração e estrutura inicial de testes. |
| 1 | Navegação, seleção de elementos e assertions de conteúdo. |
| 2 | Interações, formulários, filtros e validação de comportamento visível. |
| 3 | Hooks, aliases e isolamento de cenários. |
| 4 | Controle de rede com `cy.intercept()`, fixtures e falhas simuladas. |
| 5 | API testing, autenticação, estado de dados e sessões. |
| 6 | Custom commands e TypeScript para reuso e manutenção. |

## Nível 0 — Preparação

- [x] Confirmar que `npm run dev` inicia a interface em `http://127.0.0.1:5173`.
- [x] Confirmar que `npm run cy:open` abre o Cypress.
- [x] Usar o `baseUrl` para visitar `/login` e `/dashboard` sem informar a URL completa.
- [x] Criar uma suíte `describe` e um caso `it` para a página de login.

**Skills:** configuração local, scripts npm, `baseUrl`, estrutura `describe`/`it`.

**Critério de conclusão:** o primeiro spec abre `/login` e passa sem depender de outro teste.

## Nível 1 — Estrutura e seletores

- [x] Visitar `/login` e confirmar o título da página.
- [x] Localizar os campos pelos seletores `email` e `password`.
- [x] Confirmar que `submit-login` começa desabilitado.
- [x] Localizar o texto “Entre para analisar” com `cy.contains()`.
- [x] Após autenticar, confirmar que existe ao menos um `quote-row` no dashboard.

**Skills:** `cy.visit()`, `data-cy`, `cy.contains()` e assertions de presença, texto e estado.

## Nível 2 — Interações e assertions

- [x] Preencher credenciais inválidas e confirmar a mensagem em `error`.
- [x] Preencher as credenciais válidas, clicar em `submit-login` e confirmar a URL `/dashboard`.
- [x] Alterar `market-base` para `BRL` usando `.select()`.
- [x] Desmarcar e marcar `currency-EUR` usando `.uncheck()` e `.check()`.
- [x] Preencher `quote-search` e validar que a lista é filtrada.
- [x] Alterar `sort-quotes` e confirmar a nova ordenação.
- [x] Adicionar um par à lista e validar que `add-watchlist` fica desabilitado.
- [x] Abrir e fechar o histórico de uma cotação.

**Skills:** `.type()`, `.click()`, `.select()`, `.check()`, `.uncheck()`, URL e assertions de estados visíveis.

**Critério de conclusão:** cada teste verifica resultado visível, URL ou estado de formulário — não classes CSS internas.

## Nível 3 — Hooks, aliases e independência

- [x] Usar `beforeEach` para limpar os dados com `POST /api/test/reset`.
- [x] Criar aliases para `email`, `password` ou uma linha de cotação.
- [x] Obter o texto de `average-rate` com `.invoke('text')` e validá-lo dentro de `.then()`.
- [x] Garantir que os testes de lista pessoal funcionam isoladamente e em qualquer ordem.
- [x] Usar `afterEach` apenas para limpeza necessária, nunca para preparar o próximo teste.

**Skills:** ciclo de vida da suíte, aliases, leitura de conteúdo e isolamento de estado.

**Critério de conclusão:** executar somente um spec de lista pessoal produz o mesmo resultado da execução da suíte completa.

## Nível 4 — Rede com `cy.intercept()`

- [x] Espionar `POST /api/auth/login` antes de clicar em entrar e confirmar `200`.
- [x] Interceptar `GET /api/market/quotes*` com `quotes.json`.
- [x] Simular atraso na consulta e validar `market-spinner` antes da resposta chegar.
- [x] Simular resposta `500` e validar `market-error`.
- [x] Interceptar `POST /api/watchlist`, validar o corpo enviado e confirmar `201`.
- [x] Interceptar `GET /api/market/history*` ao abrir o histórico de uma cotação.

**Skills:** stubs e spies de rede, fixtures, `cy.wait('@alias')`, respostas HTTP e cenários de erro.

**Critério de conclusão:** nenhum teste usa `cy.wait(1000)` ou outro tempo fixo para aguardar rede.

## Nível 5 — Fixtures, API e autenticação

- [x] Carregar `cypress/fixtures/quotes.json` para testar três pares previsíveis.
- [x] Testar `POST /api/auth/login` com `cy.request()` e confirmar o token na resposta.
- [x] Testar `GET /api/auth/me` com `Authorization: Bearer <token>`.
- [x] Criar um par por `POST /api/watchlist` antes de visitar o dashboard.
- [x] Limpar o estado por `POST /api/test/reset` antes de cada cenário que altera a lista.
- [x] Criar uma sessão com `cy.session()` que persista o token em `localStorage`.

**Skills:** testes de API, headers, autenticação, fixtures, preparação de dados e sessões reutilizáveis.

### Rotas disponíveis

| Método | Rota | Finalidade |
| --- | --- | --- |
| POST | `/api/auth/login` | Autenticação fictícia |
| GET | `/api/auth/me` | Validação de sessão |
| GET | `/api/market/quotes` | Cotações cambiais |
| GET | `/api/market/history` | Série histórica |
| GET/POST/DELETE | `/api/watchlist` | Lista de análise |
| POST | `/api/test/reset` | Reset exclusivo do laboratório |

## Nível 6 — Comandos reutilizáveis e TypeScript

- [x] Usar `cy.getByCy()` em vez de repetir seletores `data-cy`.
- [x] Usar `cy.loginByApi()` para preparar testes de dashboard rapidamente.
- [x] Criar ou reutilizar `cy.addPairToWatchlist(pair)` quando esse fluxo aparecer em vários specs.
- [x] Declarar o tipo de cada novo comando em `cypress/support/index.d.ts`.
- [x] Executar `npm run typecheck:tests` depois de alterar comandos ou specs TypeScript.

**Skills:** abstração consciente, comandos customizados, declarações globais e segurança de tipos.

**Critério de conclusão:** a abstração torna o teste mais legível sem esconder a regra de negócio validada.

## Comandos do desafio

```bash
npm install
npm run dev
npm run cy:open
npm run cy:run
npm run test:e2e
npm run typecheck:tests
```

O `POST /api/test/reset`, as credenciais e o token são exclusivos deste laboratório e não devem ser usados em produção.
