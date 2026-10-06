# CEP Explorer — TypeScript + ViaCEP + SQLite

Evolução de um projeto de consulta de CEP que começou como script Python e CSV. A versão atual possui interface web, backend em TypeScript, consumo de API REST e persistência SQL.

A implementação anterior foi preservada em `legacy-python/`.

## Tecnologias

- TypeScript e Node.js 24
- JavaScript, HTML e CSS
- API REST ViaCEP
- SQLite / SQL
- Git
- node:test

## Funcionalidades

- validação e normalização de CEP
- consulta de endereço pela API ViaCEP
- cache local em SQLite para evitar consultas repetidas
- histórico das consultas mais recentes
- interface web responsiva
- tratamento de erros de rede e CEP inexistente
- testes automatizados de validação e endpoints

## Executar

```bash
git clone https://github.com/perfilcorporativo/projeto_consulta_api.git
cd projeto_consulta_api
npm start
```

Acesse `http://127.0.0.1:3001`.

## Testes

```bash
npm test
```

## Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/health` | health check |
| GET | `/api/cep/:cep` | consulta e armazena um CEP |
| GET | `/api/history` | últimas consultas |

Na primeira consulta o backend busca no ViaCEP e persiste o resultado. Nas próximas consultas do mesmo CEP, retorna o SQLite com `cache: true`.

## Estrutura

```text
src/            backend TypeScript e persistência
public/         interface web
tests/          testes
schema.sql      modelo SQL
legacy-python/  primeira versão em Python + CSV
```

## O que pratiquei

Integração com serviços externos, modelagem SQL, cache simples, APIs REST, tratamento de erros e integração frontend/backend.

## Próximos passos

- expiração configurável do cache
- paginação do histórico
- métricas de uso
- documentação OpenAPI
