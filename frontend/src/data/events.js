// 50 Random Events with punishments
export const EVENTS = [
  { id: 1, title: "Faltou ao Treino", description: "Multa de 1 semana de salário.", severity: "low", punishment: "Multa" },
  { id: 2, title: "Atraso na Preleção", description: "Banco no próximo jogo.", severity: "low", punishment: "Banco 1 jogo" },
  { id: 3, title: "Discutiu com Auxiliar", description: "Banco por 2 jogos.", severity: "medium", punishment: "Banco 2 jogos" },
  { id: 4, title: "Reclamou ao ser Substituído", description: "Multa + Banco 1 jogo.", severity: "medium", punishment: "Multa + Banco" },
  { id: 5, title: "Visto em Balada antes de Jogo", description: "Afastado por 1 semana.", severity: "high", punishment: "Afastamento 1 semana" },
  { id: 6, title: "Postou Tática no Instagram", description: "Lista de Transferências.", severity: "critical", punishment: "Lista de Transferências" },
  { id: 7, title: "Chegou Bêbado no Treino", description: "Afastado por 1 mês.", severity: "critical", punishment: "Afastamento 1 mês" },
  { id: 8, title: "Briga Física com Companheiro", description: "Suspenso por 3 jogos.", severity: "high", punishment: "Suspensão 3 jogos" },
  { id: 9, title: "Recusou Renovar Contrato", description: "Colocar à venda.", severity: "high", punishment: "À venda" },
  { id: 10, title: "Pediu Aumento Abusivo", description: "Negar e colocar no banco.", severity: "medium", punishment: "Banco" },
  { id: 11, title: "Elogiou Rival na Imprensa", description: "Multa de 2 semanas.", severity: "medium", punishment: "Multa pesada" },
  { id: 12, title: "Engordou 3kg nas Férias", description: "Treino físico extra (Stamina -5 temporário).", severity: "low", punishment: "Treino extra" },
  { id: 13, title: "Esqueceu Chuteiras", description: "Pagar jantar pro time.", severity: "low", punishment: "Pagou jantar" },
  { id: 14, title: "Uso de Celular no Vestiário", description: "Multa leve.", severity: "low", punishment: "Multa leve" },
  { id: 15, title: "Dormiu na Reunião Tática", description: "Banco imediato.", severity: "medium", punishment: "Banco" },
  { id: 16, title: "Jogou Padel e Torceu Tornozelo", description: "Fora por 2 semanas.", severity: "medium", punishment: "Lesão 2 semanas" },
  { id: 17, title: "Comeu Fast-Food antes do Jogo", description: "Multa de peso.", severity: "low", punishment: "Multa" },
  { id: 18, title: "Criticou a Torcida", description: "Pedir desculpas públicas + Banco.", severity: "high", punishment: "Desculpas + Banco" },
  { id: 19, title: "Vazou Escalação pro Jornalista", description: "Lista de Transferências.", severity: "critical", punishment: "Lista de Transferências" },
  { id: 20, title: "Flagrado Fumando", description: "Multa pesada + Banco 3 jogos.", severity: "high", punishment: "Multa + Banco 3 jogos" },
  { id: 21, title: "Xingou o Árbitro (pós-jogo)", description: "Suspenso pela diretoria 1 jogo.", severity: "medium", punishment: "Suspensão 1 jogo" },
  { id: 22, title: "Não Cumprimentou o Técnico", description: "Perde a braçadeira (se for capitão) ou Banco.", severity: "medium", punishment: "Perde braçadeira/Banco" },
  { id: 23, title: "Chegou de Ferrari Nova e Bateu", description: "Zoação do elenco (Moral baixa).", severity: "low", punishment: "Moral baixa" },
  { id: 24, title: "Perdeu Voo para Partida Fora", description: "Multa de 1 mês + Afastamento.", severity: "high", punishment: "Multa + Afastamento" },
  { id: 25, title: "Fez Live no TikTok Concentrado", description: "Multa leve.", severity: "low", punishment: "Multa leve" },
  { id: 26, title: "Pintou o Cabelo de Verde (cor do rival)", description: "Obrigar a raspar.", severity: "low", punishment: "Raspar cabelo" },
  { id: 27, title: "Simulou Lesão para Não Jogar", description: "Lista de Empréstimo.", severity: "high", punishment: "Lista de Empréstimo" },
  { id: 28, title: "Agente Reclamou na Imprensa", description: "Conversa séria com jogador.", severity: "low", punishment: "Advertência" },
  { id: 29, title: "Foi Pai", description: "Folga de 2 dias (Moral Sobe).", severity: "positive", punishment: "Folga 2 dias" },
  { id: 30, title: "Comprou Briga de Torcida", description: "Multa Severa.", severity: "high", punishment: "Multa severa" },
  { id: 31, title: "Investigado por Apostas", description: "Afastamento Indeterminado.", severity: "critical", punishment: "Afastamento indeterminado" },
  { id: 32, title: "Recusou Entrar em Campo", description: "Rescisão de Contrato ou Lista de Transferências.", severity: "critical", punishment: "Rescisão/Transferência" },
  { id: 33, title: "Trocou Camisa no Intervalo", description: "Multa e substituição imediata.", severity: "medium", punishment: "Multa + Substituição" },
  { id: 34, title: "Perdeu Gol Feito de Propósito", description: "Banco 5 jogos.", severity: "high", punishment: "Banco 5 jogos" },
  { id: 35, title: "Esqueceu Passaporte na Champions", description: "Não viaja + Multa.", severity: "medium", punishment: "Não viaja + Multa" },
  { id: 36, title: "Deu Entrevista Bêbado", description: "Afastamento e Reabilitação.", severity: "high", punishment: "Afastamento + Reab." },
  { id: 37, title: "Visto com Camisa de Outro Time", description: "Explicação pública exigida.", severity: "medium", punishment: "Explicação pública" },
  { id: 38, title: "Reclamou do Gramado Publicamente", description: "Advertência.", severity: "low", punishment: "Advertência" },
  { id: 39, title: "Acusado de Sonegação Fiscal", description: "Apoio jurídico do clube (Moral cai).", severity: "medium", punishment: "Moral baixa" },
  { id: 40, title: "Patrocinador Pessoal Conflita com Clube", description: "Multa diária até resolver.", severity: "low", punishment: "Multa diária" },
  { id: 41, title: "Não Aprendeu o Idioma (estrangeiro)", description: "Aulas obrigatórias extras.", severity: "low", punishment: "Aulas extras" },
  { id: 42, title: "Influencer Digital Demais", description: "Proibido redes sociais por 1 mês.", severity: "medium", punishment: "Sem redes 1 mês" },
  { id: 43, title: "Romance com Filha do Presidente", description: "Venda Imediata.", severity: "critical", punishment: "Venda imediata" },
  { id: 44, title: "Comeu Lasanha na Véspera do Jogo", description: "Banco por indigestão.", severity: "low", punishment: "Banco 1 jogo" },
  { id: 45, title: "Chegou de Helicóptero no Treino", description: "Advertência por ostentação.", severity: "low", punishment: "Advertência" },
  { id: 46, title: "Recusou dar Autógrafo a Criança", description: "Trabalho comunitário obrigatório.", severity: "medium", punishment: "Trabalho comunitário" },
  { id: 47, title: "Jogou Videogame até as 4am", description: "Banco por cansaço.", severity: "medium", punishment: "Banco 1 jogo" },
  { id: 48, title: "Esqueceu Caneleira", description: "Jogar com improviso (risco de lesão).", severity: "low", punishment: "Risco de lesão" },
  { id: 49, title: "Disse que Sonha Jogar no Real Madrid", description: "Torcida vaia (Moral cai).", severity: "medium", punishment: "Moral baixa" },
  { id: 50, title: "Pego no Doping (remédio de cabelo)", description: "Suspensão longa.", severity: "critical", punishment: "Suspensão longa" }
];

// Get severity color
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'low': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-500' };
    case 'medium': return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-500' };
    case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-500' };
    case 'critical': return { bg: 'bg-blood/20', border: 'border-blood', text: 'text-red-400' };
    case 'positive': return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-500' };
    default: return { bg: 'bg-zinc-500/20', border: 'border-zinc-500', text: 'text-zinc-400' };
  }
};

// Get severity label
export const getSeverityLabel = (severity) => {
  switch (severity) {
    case 'low': return 'Baixo';
    case 'medium': return 'Médio';
    case 'high': return 'Alto';
    case 'critical': return 'Crítico';
    case 'positive': return 'Positivo';
    default: return 'Desconhecido';
  }
};
