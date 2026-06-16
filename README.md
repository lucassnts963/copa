# ⚽ Copa 2026 — Acompanhamento da Copa do Mundo FIFA

Plataforma completa para acompanhar a **Copa do Mundo FIFA 2026** (EUA, Canadá e México) em tempo real. Desenvolvida em Next.js com dados atualizados automaticamente via GitHub, a aplicação reúne jogos, grupos, chaveamento, artilharia e um sistema de bolão para apostar com amigos — tudo em português.

---

## 📸 Telas do Projeto

### Página Principal — Jogos
> Lista todos os jogos do torneio por data, com placar ao vivo, status (ao vivo / encerrado / a realizar) e link para assistir na CazéTV.

![Jogos](docs/screenshots/jogos.png)

---

### Grupos
> Tabela de classificação de cada grupo (A–H) com pontos, vitórias, empates, derrotas e saldo de gols.

![Grupos](docs/screenshots/grupos.png)

---

### Chaveamento
> Árvore visual das fases eliminatórias: Oitavas → Quartas → Semifinais → Final, com atualização em tempo real.

![Chaveamento](docs/screenshots/chaveamento.png)

---

### Ranking Geral
> Classificação geral de todas as seleções com critérios de desempate (pontos, saldo, fair play).

![Ranking](docs/screenshots/ranking.png)

---

### Artilharia
> Tabela dos maiores artilheiros da competição, com gols, assistências e penaltis.

![Artilharia](docs/screenshots/artilharia.png)

---

### Seleções
> Grade de todas as seleções participantes com bandeiras, nome em português e informações do grupo.

![Seleções](docs/screenshots/selecoes.png)

---

### Bolão
> Sistema de bolão para criar/entrar em grupos de aposta com amigos. Previsões e pontuação automática.

![Bolão](docs/screenshots/bolao.png)

---

### Painel Admin
> Interface administrativa (protegida por senha) para atualizar resultados, artilheiros e chaveamento.

![Admin](docs/screenshots/admin.png)

---

## ✨ Funcionalidades

- **7 abas principais**: Jogos · Grupos · Chaveamento · Ranking · Artilharia · Seleções · Bolão
- **Atualização automática** dos dados a cada 5 minutos via GitHub CDN
- **Fallback local** com dados estáticos quando offline
- **Cache inteligente** no `localStorage` (sem re-fetches desnecessários)
- **Bolão de apostas**: crie/entre em grupos, faça previsões e veja pontuação em tempo real
- **Painel admin** protegido por chave para atualizar placar, artilheiros e bracket
- **Links para CazéTV** diretamente nos cards de jogos
- **Perfil de jogadores** e páginas de detalhe por seleção
- **Dados históricos** da Copa América 2024 inclusos
- **Tradução automática** via DeepSeek API para nomes em português
- **Tema escuro** responsivo e otimizado para mobile
- **Ícones de bandeiras** em múltiplas resoluções (16 / 32 / 64 / 128 / 256 px)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| UI | [React 18](https://react.dev/) |
| Estilização | [Tailwind CSS 3](https://tailwindcss.com/) |
| Ícones | [Lucide React](https://lucide.dev/) |
| Tipografia | IBM Plex Sans & IBM Plex Mono (Google Fonts) |
| Dados | GitHub Raw CDN + arquivos locais JSON |
| Cache | `localStorage` (5 min TTL) |
| Tradução | [DeepSeek API](https://platform.deepseek.com/) |
| Deploy | Vercel / qualquer plataforma Node.js |

---

## 📁 Estrutura do Projeto

```
copa/
├── app/
│   ├── page.jsx                        # Redireciona para /copa
│   ├── layout.jsx                      # Layout global (fontes, meta)
│   ├── globals.css                     # Estilos globais
│   ├── copa/
│   │   ├── page.jsx                    # Hub principal (7 abas)
│   │   ├── admin/page.jsx              # Painel administrativo
│   │   ├── match/[matchId]/page.jsx    # Detalhe de partida
│   │   ├── [teamId]/page.jsx           # Perfil de seleção
│   │   ├── jogador/[name]/page.jsx     # Perfil de jogador
│   │   ├── partida/[id]/page.jsx       # Rota alternativa de partida
│   │   ├── selecao/[name]/page.jsx     # Rota alternativa de seleção
│   │   ├── _components/
│   │   │   ├── CopaClient.jsx          # Orquestrador principal
│   │   │   ├── Jogos.jsx               # Cards de jogos por data
│   │   │   ├── Grupos.jsx              # Tabelas de grupos A–H
│   │   │   ├── Chaveamento.jsx         # Árvore do chaveamento
│   │   │   ├── RankingGeral.jsx        # Ranking de todas as seleções
│   │   │   ├── Artilharia.jsx          # Top artilheiros
│   │   │   ├── Selecoes.jsx            # Grade de seleções
│   │   │   ├── Bolao.jsx               # Sistema de bolão
│   │   │   ├── BolaoLanding.jsx        # Criar/entrar em bolão
│   │   │   ├── PoolDetail.jsx          # Detalhe do bolão
│   │   │   ├── CreatePoolModal.jsx     # Modal de criação de bolão
│   │   │   ├── Bracket.jsx             # Componente de bracket
│   │   │   ├── Arvore.jsx              # Vizualização em árvore
│   │   │   └── Jogadores.jsx           # Lista de jogadores
│   │   └── _lib/
│   │       ├── api.js                  # Funções de fetch para a API
│   │       ├── data.js                 # Transformação de dados
│   │       ├── bolao.js                # Lógica do sistema de bolão
│   │       ├── betting.js              # Cálculo de pontuação
│   │       └── storage.js              # Cache localStorage
│   └── api/
│       ├── copa/
│       │   ├── matches/route.js        # GET — todos os jogos
│       │   ├── groups/route.js         # GET — classificação dos grupos
│       │   ├── teams/route.js          # GET — seleções participantes
│       │   ├── bracket/route.js        # GET — chaveamento
│       │   ├── rankings/route.js       # GET — ranking geral
│       │   ├── scorers/route.js        # GET — artilheiros
│       │   ├── players/route.js        # GET — elenco por seleção
│       │   ├── player/route.js         # GET — jogador individual
│       │   ├── translate/route.js      # GET — tradução via DeepSeek
│       │   └── admin/route.js          # GET/POST — gerenciar dados
│       └── flags/[code]/route.js       # GET — imagens de bandeiras
├── public/
│   ├── data/
│   │   ├── worldcup/                   # Dados da Copa 2026
│   │   │   ├── matches.json
│   │   │   ├── standings.json
│   │   │   ├── bracket.json
│   │   │   ├── scorers.json
│   │   │   ├── teams.json
│   │   │   ├── teams.pt.json
│   │   │   └── players.json
│   │   └── copa/                       # Dados históricos Copa América 2024
│   │       ├── matches.json
│   │       ├── standings.json
│   │       ├── bracket.json
│   │       ├── teams.json
│   │       ├── players.json
│   │       ├── players-detail.json
│   │       ├── venues.json
│   │       └── cazetv.json
│   └── flags/                          # Bandeiras PNG (16–2560px)
├── .env.example
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 🔌 Rotas da API

| Endpoint | Método | Descrição | Revalidação |
|----------|--------|-----------|-------------|
| `/api/copa/matches` | GET | Todos os jogos com placar e status | 5 min |
| `/api/copa/groups` | GET | Classificação dos grupos A–H | 5 min |
| `/api/copa/teams` | GET | Seleções com bandeiras e grupo | Estático |
| `/api/copa/bracket` | GET | Chaveamento das fases eliminatórias | 5 min |
| `/api/copa/rankings` | GET | Ranking geral com critérios de desempate | 5 min |
| `/api/copa/scorers` | GET | Lista de artilheiros | 5 min |
| `/api/copa/players` | GET | Elencos (`?team=BRA` para filtrar) | Servidor |
| `/api/copa/translate` | GET | Tradução de texto via DeepSeek | Imutável |
| `/api/copa/admin` | GET/POST | Autenticação e atualização de dados | — |
| `/api/flags/[code]` | GET | Imagem PNG da bandeira por código | 1 ano |

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### 1. Clone o repositório

```bash
git clone https://github.com/lucassnts963/copa.git
cd copa
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
# Chave para autenticar na área admin (/copa/admin)
# Enviada como header: x-admin-key
ADMIN_KEY=troque-por-uma-chave-forte

# Token do GitHub para salvar dados no repositório de dados
# Permissão necessária: Contents (write) no repo lucassnts963/lucas-data
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# (Opcional) Chave da API DeepSeek para tradução automática
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx
```

### 4. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Fluxo de Dados

```
┌─────────────────────────────────────┐
│         Frontend (Browser)          │
│   CopaClient + localStorage cache   │
└──────────────┬──────────────────────┘
               │ fetch /api/copa/*
               ▼
┌─────────────────────────────────────┐
│         API Routes (Next.js)        │
│   Revalidação a cada 5 minutos      │
└──────────────┬──────────────────────┘
               │ fetch raw JSON
               ▼
┌─────────────────────────────────────┐
│   GitHub Raw CDN                    │
│   lucassnts963/lucas-data           │
│   /worldcup/{matches|standings...}  │
└──────────────┬──────────────────────┘
               │ fallback (offline)
               ▼
┌─────────────────────────────────────┐
│   Arquivos Locais                   │
│   /public/data/worldcup/*.json      │
└─────────────────────────────────────┘

Admin Update Flow:
POST /api/copa/admin → Salva local → Push GitHub API
```

---

## 🔐 Painel Administrativo

Acesse `/copa/admin` com a chave configurada em `ADMIN_KEY`.

O painel permite:

- **Resultados**: Editar placar, status e horário de cada jogo
- **Artilheiros**: Adicionar/editar/remover jogadores da artilharia
- **Chaveamento (R32)**: Editar confrontos das oitavas até a final

Ao salvar, os dados são gravados localmente **e** enviados ao repositório `lucassnts963/lucas-data` via GitHub API, garantindo persistência.

---

## 🌐 Deploy

### Vercel (recomendado)

```bash
vercel deploy
```

Configure as variáveis de ambiente no painel da Vercel:
- `ADMIN_KEY`
- `GITHUB_TOKEN`
- `DEEPSEEK_API_KEY` (opcional)

### Outras plataformas

Qualquer plataforma com suporte a Node.js 18+ e variáveis de ambiente funciona (Railway, Render, Coolify, etc.).

---

## 📝 Licença

MIT © [Lucas Santos](https://elucas.dev)
