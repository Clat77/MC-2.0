// Leagues data with logos
export const LEAGUES = [
  { name: "Premier League", logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" },
  { name: "EFL Championship", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/EFL_Championship.svg" },
  { name: "EFL League One", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/EFL_League_One.png" },
  { name: "EFL League Two", logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/EFL_League_Two.png" },
  { name: "Bundesliga", logo: "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg" },
  { name: "2. Bundesliga", logo: "https://upload.wikimedia.org/wikipedia/en/a/aa/2._Bundesliga_logo.svg" },
  { name: "LaLiga", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg" },
  { name: "LaLiga 2", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/LaLiga_Hypermotion_Logo_2023.svg" },
  { name: "Serie A", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg" },
  { name: "Serie B", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Serie_BKT_2024_logo.svg" },
  { name: "Ligue 1", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue_1_Uber_Eats_logo.svg" },
  { name: "Ligue 2", logo: "https://upload.wikimedia.org/wikipedia/commons/2/25/Ligue_2_BKT.svg" },
  { name: "Liga Portugal", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Liga_Portugal_Betclic.svg" }
];

// Generic teams by league
export const TEAMS_BY_LEAGUE = {
  "Premier League": ["Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Ipswich Town", "Leicester City", "Liverpool", "Manchester City", "Manchester United", "Newcastle", "Nottingham Forest", "Southampton", "Tottenham", "West Ham", "Wolverhampton"],
  "EFL Championship": ["Blackburn", "Bristol City", "Burnley", "Cardiff", "Coventry", "Derby County", "Hull City", "Leeds United", "Luton Town", "Middlesbrough", "Millwall", "Norwich", "Oxford United", "Plymouth", "Portsmouth", "Preston", "QPR", "Sheffield United", "Sheffield Wednesday", "Stoke City", "Sunderland", "Swansea", "Watford", "West Brom"],
  "EFL League One": ["Barnsley", "Birmingham City", "Bolton", "Bristol Rovers", "Burton Albion", "Cambridge", "Charlton", "Crawley Town", "Exeter City", "Huddersfield", "Leyton Orient", "Lincoln City", "Mansfield", "Northampton", "Peterborough", "Reading", "Rotherham", "Shrewsbury", "Stevenage", "Stockport", "Wigan", "Wrexham", "Wycombe"],
  "EFL League Two": ["AFC Wimbledon", "Accrington", "Barrow", "Bradford City", "Bromley", "Carlisle", "Cheltenham", "Colchester", "Crewe", "Doncaster", "Fleetwood", "Gillingham", "Grimsby", "Harrogate", "MK Dons", "Morecambe", "Newport County", "Notts County", "Port Vale", "Salford City", "Swindon", "Tranmere", "Walsall"],
  "Bundesliga": ["Augsburg", "Bayern Munich", "Bayer Leverkusen", "Bochum", "Borussia Dortmund", "Borussia M'gladbach", "Eintracht Frankfurt", "Freiburg", "Heidenheim", "Hoffenheim", "Holstein Kiel", "Mainz 05", "RB Leipzig", "St. Pauli", "Stuttgart", "Union Berlin", "Werder Bremen", "Wolfsburg"],
  "2. Bundesliga": ["Braunschweig", "Darmstadt", "Düsseldorf", "Elversberg", "Greuther Fürth", "Hamburg", "Hannover 96", "Hertha Berlin", "Jahn Regensburg", "Kaiserslautern", "Karlsruher", "Köln", "Magdeburg", "Nürnberg", "Paderborn", "Preußen Münster", "Schalke 04", "Ulm"],
  "LaLiga": ["Alavés", "Athletic Bilbao", "Atlético Madrid", "Barcelona", "Betis", "Celta Vigo", "Espanyol", "Getafe", "Girona", "Las Palmas", "Leganés", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Valladolid", "Villarreal"],
  "LaLiga 2": ["Albacete", "Almería", "Burgos", "Cartagena", "Castellón", "Córdoba", "Deportivo La Coruña", "Eibar", "Elche", "Eldense", "Granada", "Huesca", "Levante", "Málaga", "Mirandés", "Oviedo", "Racing Santander", "Racing Ferrol", "Sporting Gijón", "Tenerife", "Zaragoza"],
  "Serie A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter Milan", "Juventus", "Lazio", "Lecce", "AC Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "Serie B": ["Bari", "Brescia", "Carrarese", "Catanzaro", "Cesena", "Cittadella", "Cosenza", "Cremonese", "Frosinone", "Juve Stabia", "Mantova", "Modena", "Palermo", "Pisa", "Reggiana", "Salernitana", "Sampdoria", "Sassuolo", "Spezia", "Südtirol"],
  "Ligue 1": ["Angers", "Auxerre", "Brest", "Le Havre", "Lens", "Lille", "Lyon", "Marseille", "Monaco", "Montpellier", "Nantes", "Nice", "Paris Saint-Germain", "Reims", "Rennes", "Saint-Étienne", "Strasbourg", "Toulouse"],
  "Ligue 2": ["Ajaccio", "Amiens", "Bastia", "Caen", "Clermont", "Dunkerque", "Grenoble", "Guingamp", "Laval", "Lorient", "Martigues", "Metz", "Paris FC", "Pau", "Red Star", "Rodez", "Troyes", "Valenciennes"],
  "Liga Portugal": ["Arouca", "AVS Futebol", "Benfica", "Boavista", "Braga", "Casa Pia", "Estoril", "Estrela Amadora", "Famalicão", "Farense", "Gil Vicente", "Moreirense", "Nacional", "Porto", "Rio Ave", "Santa Clara", "Sporting CP", "Vitória Guimarães"]
};

// Competitions
export const COMPETITIONS = [
  "Liga",
  "Copa Nacional",
  "Copa da Liga",
  "Champions League",
  "Europa League",
  "Conference League",
  "Supercopa",
  "Mundial de Clubes",
  "Amistoso"
];

// Tactics
export const TACTICS = [
  "4-3-3 Posse de Bola",
  "4-3-3 Contra-Ataque",
  "4-4-2 Clássico",
  "4-4-2 Losango",
  "4-2-3-1 Equilibrado",
  "3-5-2 Alas",
  "3-4-3 Pressão Alta",
  "5-3-2 Retranca",
  "4-1-4-1 Defensivo",
  "4-3-2-1 Árvore de Natal"
];

// Player positions
export const POSITIONS = [
  { code: "GOL", name: "Goleiro", category: "Goleiro" },
  { code: "ZAG", name: "Zagueiro", category: "Defesa" },
  { code: "LE", name: "Lateral Esquerdo", category: "Defesa" },
  { code: "LD", name: "Lateral Direito", category: "Defesa" },
  { code: "VOL", name: "Volante", category: "Meio-campo" },
  { code: "MC", name: "Meia Central", category: "Meio-campo" },
  { code: "MEI", name: "Meia Ofensivo", category: "Meio-campo" },
  { code: "PE", name: "Ponta Esquerda", category: "Ataque" },
  { code: "PD", name: "Ponta Direita", category: "Ataque" },
  { code: "SA", name: "Segundo Atacante", category: "Ataque" },
  { code: "CA", name: "Centroavante", category: "Ataque" }
];

// Newspaper headlines templates
export const NEWSPAPER_HEADLINES = [
  "REVOLUÇÃO NO {team}! Técnico {coach} promete título!",
  "CRISE? {team} busca se reerguer após momento difícil",
  "{coach}: 'Vamos lutar até o fim pela taça!'",
  "MERCADO AQUECIDO: {team} de olho em reforços de peso",
  "Torcida do {team} esgota ingressos para próximo jogo",
  "ANÁLISE: O novo estilo de jogo do {team} sob {coach}",
  "{team} trabalha em silêncio visando o topo da tabela",
  "EXCLUSIVO: Os bastidores do CT do {team}",
  "{coach} aposta em jovens da base do {team}",
  "POLÊMICA: Árbitro controverso apitará jogo do {team}",
  "PRESSÃO! Torcida cobra resultados do {team}",
  "REFORÇO à vista? {team} negocia com estrela internacional",
  "{team} mira virada histórica na temporada",
  "Os segredos táticos de {coach} no comando do {team}",
  "DESFALQUES: {team} terá baixas importantes no clássico"
];
