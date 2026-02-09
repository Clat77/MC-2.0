# Gestor de MC - Product Requirements Document

## Visão Geral
**Nome do Projeto:** Gestor de MC (Gestor de Modo Carreira)  
**Tipo:** Single Page Application (SPA)  
**Propósito:** Gerenciamento de saves de jogos de futebol (EA FC/FIFA)  
**Stack:** React + TailwindCSS + Shadcn/UI + localStorage

## User Personas

### 1. Jogador Hardcore de Modo Carreira
- Joga FIFA/EA FC regularmente
- Quer rastrear estatísticas detalhadas
- Valoriza a imersão e storytelling

### 2. Criador de Conteúdo
- Documenta sua jornada no modo carreira
- Precisa de dados organizados para conteúdo
- Exporta/importa saves entre dispositivos

## Requisitos Core (Implementados ✅)

### Sistema de Saves
- ✅ Criar novo save com wizard de 4 passos (Técnico, Liga, Clube, Temporada)
- ✅ Importar/Exportar saves em JSON
- ✅ Múltiplos saves simultâneos
- ✅ Persistência em localStorage

### Dashboard
- ✅ Header com escudo do time, nome, técnico, temporada
- ✅ Manchete de jornal estilo "Gazeta Esportiva" (15 templates)
- ✅ Últimos 5 jogos (forma: V/E/D)
- ✅ Próxima partida com contagem regressiva
- ✅ Alertas (falta de profundidade, rivalidades)
- ✅ Estatísticas de temporada

### Gestão de Elenco
- ✅ Visualização em Lista e Campo
- ✅ Cadastro completo (Nome, Posição, Idade, OVR, POT, Valor, Foto)
- ✅ Status automático (🔥 Fire >= 7.5, 😐 Normal, ❄️ Ice < 6.0)
- ✅ Badges (Ídolo: 50+ jogos E média > 7.0 OU 30+ gols; Lenda: 100+ jogos E média > 7.5)
- ✅ Hierarquia (Capitão C, Vice VC)

### Motor de Partidas
- ✅ Registro de jogos (Adversário, Competição, Tática, Placar)
- ✅ Notas dos jogadores com slider
- ✅ Artilheiros por partida
- ✅ Rivalidade dinâmica (Carrasco: 3 derrotas, Freguês: 3 vitórias)
- ✅ Estatísticas por tática

### Calendário
- ✅ Adicionar partida manual com DatePicker
- ✅ Importação em lote (formato: DD/MM;Adversário;Competição;C/F)
- ✅ Visualização mensal
- ✅ Lista de próximas partidas

### Escritório (Eventos)
- ✅ 50 eventos aleatórios com severidades (Baixo, Médio, Alto, Crítico, Positivo)
- ✅ Gerador aplica evento a jogador aleatório
- ✅ Modal com feedback visual por severidade
- ✅ Histórico de eventos

### Museu
- ✅ Galeria de troféus
- ✅ Hall da Fama (Ídolos e Lendas automáticos)
- ✅ Histórico de temporadas
- ✅ Encerrar temporada (arquiva stats, zera contadores, incrementa ano)

### Estatísticas Avançadas (Gráficos)
- ✅ Distribuição de resultados (Pie Chart)
- ✅ Evolução de gols (Area Chart)
- ✅ Desempenho por tática (Bar Chart)
- ✅ Média de notas dos jogadores (Bar Chart)
- ✅ Tabela de artilheiros

## Design System - Tema "Mafia Luxury"

### Cores
- Fundo: Gradiente #121212 → #0a0a0a
- Primária (Ouro): #D4AF37
- Perigo (Sangue): #8a0303
- Texto: #ffffff com variações de cinza

### Tipografia
- Títulos: Barlow Condensed (700/600)
- Corpo: Manrope
- Citações/Jornal: Playfair Display (Itálico)

### Componentes
- Cards com bordas sharp (rounded-sm)
- Botões uppercase tracking-widest
- Hover effects com gold glow
- Mobile-first com Drawer navigation

## Dados Incluídos

### 13 Ligas
Premier League, EFL Championship, EFL League One, EFL League Two, Bundesliga, 2. Bundesliga, LaLiga, LaLiga 2, Serie A, Serie B, Ligue 1, Ligue 2, Liga Portugal

### 9 Competições
Liga, Copa Nacional, Copa da Liga, Champions League, Europa League, Conference League, Supercopa, Mundial de Clubes, Amistoso

### 10 Táticas
4-3-3 Posse, 4-3-3 Contra-Ataque, 4-4-2 Clássico, 4-4-2 Losango, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2, 4-1-4-1, 4-3-2-1

### 11 Posições
GOL, ZAG, LE, LD, VOL, MC, MEI, PE, PD, SA, CA

### 50 Eventos Aleatórios
Desde "Faltou ao Treino" até "Pego no Doping" com punições específicas

## Backlog Futuro (P1/P2)

### P1 - Próximas Iterações
- [ ] Modo escuro/claro alternável
- [ ] Busca de jogadores
- [ ] Ordenação de colunas na tabela
- [ ] Drag & drop para formação no campo
- [ ] Notificações de eventos importantes

### P2 - Melhorias
- [ ] Comparativo entre temporadas
- [ ] Estatísticas de confrontos diretos detalhadas
- [ ] Sistema de conquistas/achievements
- [ ] Integração com APIs de dados reais (opcional)
- [ ] PWA para uso offline

## Datas de Implementação

- **09/02/2026:** MVP completo com todas as funcionalidades core
  - Sistema de saves com wizard
  - Dashboard com manchetes
  - Gestão de elenco com status/badges
  - Motor de partidas com rivalidades
  - Calendário com import em lote
  - Escritório com 50 eventos
  - Museu com troféus e hall da fama
  - Estatísticas avançadas com gráficos (Recharts)
  - Tema Mafia Luxury implementado
  - Interface 100% PT-BR
  - Responsividade mobile com Drawer

## Arquitetura

```
/frontend/src/
├── App.js                    # Router e providers
├── context/
│   └── GameContext.js        # Estado global com localStorage
├── components/
│   ├── AppLayout.js          # Layout com sidebar/drawer
│   └── ImageFallback.js      # Componentes de imagem com fallback
├── pages/
│   ├── SaveSelection.js      # Tela inicial e wizard
│   ├── Dashboard.js          # Dashboard principal
│   ├── Squad.js              # Gestão de elenco
│   ├── Matches.js            # Motor de partidas
│   ├── Calendar.js           # Calendário
│   ├── Statistics.js         # Gráficos e análises
│   ├── Office.js             # Eventos aleatórios
│   └── Museum.js             # Troféus e hall da fama
├── data/
│   ├── constants.js          # Ligas, times, táticas, posições
│   └── events.js             # 50 eventos com severidades
└── utils/
    └── helpers.js            # localStorage, formatação, cálculos
```

## Como Rodar

```bash
cd frontend
yarn install
yarn start
```

Acesse: http://localhost:3000
