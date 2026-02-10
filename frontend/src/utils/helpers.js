import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STORAGE_KEY = 'gestor_mc_data';

// LocalStorage helpers
export const storage = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return null;
    }
  },
  
  set: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error writing localStorage:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Date formatting helpers
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, formatStr, { locale: ptBR });
};

export const formatDateLong = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
};

// Calculate player status based on ratings
export const getPlayerStatus = (player) => {
  if (!player.ratings || player.ratings.length === 0) return 'normal';
  
  const avgRating = player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length;
  
  if (avgRating >= 7.5) return 'fire';
  if (avgRating < 6.0) return 'ice';
  return 'normal';
};

// Calculate player badge (Ídolo/Lenda)
export const getPlayerBadge = (player) => {
  const games = player.games || 0;
  const goals = player.goals || 0;
  const avgRating = player.ratings?.length > 0 
    ? player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length 
    : 0;
  
  if (games > 100 && avgRating > 7.5) return 'lenda';
  if (games > 50 && (avgRating > 7.0 || goals > 30)) return 'idolo';
  return null;
};

// Calculate form (last 5 results)
export const getFormArray = (matches) => {
  if (!matches || matches.length === 0) return [];
  
  const recentMatches = matches
    .filter(m => m.played)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  return recentMatches.map(m => {
    if (m.goalsFor > m.goalsAgainst) return 'V';
    if (m.goalsFor < m.goalsAgainst) return 'D';
    return 'E';
  }).reverse();
};

// Check for depth issues in squad
export const checkSquadDepth = (players) => {
  const positionCounts = {};
  
  players.forEach(p => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });
  
  const criticalPositions = ['GOL', 'ZAG', 'MC', 'CA'];
  const weakPositions = criticalPositions.filter(pos => (positionCounts[pos] || 0) < 2);
  
  return weakPositions;
};

// Check for active rivalries
export const checkRivalries = (matches) => {
  if (!matches || matches.length === 0) return [];
  
  const opponentResults = {};
  
  matches.filter(m => m.played).forEach(m => {
    if (!opponentResults[m.opponent]) {
      opponentResults[m.opponent] = { wins: 0, losses: 0, streak: [] };
    }
    
    const result = m.goalsFor > m.goalsAgainst ? 'W' : m.goalsFor < m.goalsAgainst ? 'L' : 'D';
    opponentResults[m.opponent].streak.push(result);
    
    if (result === 'W') opponentResults[m.opponent].wins++;
    if (result === 'L') opponentResults[m.opponent].losses++;
  });
  
  const rivalries = [];
  
  Object.entries(opponentResults).forEach(([opponent, data]) => {
    const lastThree = data.streak.slice(-3);
    if (lastThree.length === 3) {
      if (lastThree.every(r => r === 'L')) {
        rivalries.push({ opponent, type: 'carrasco' });
      } else if (lastThree.every(r => r === 'W')) {
        rivalries.push({ opponent, type: 'fregues' });
      }
    }
  });
  
  return rivalries;
};

// Get next match - simply find first unplayed match
export const getNextMatch = (matches) => {
  if (!matches || matches.length === 0) return null;
  return matches.find(m => !m.played) || null;
};

// Parse calendar import format (DD/MM;Adversário;Competição;C ou F)
export const parseCalendarImport = (text, year) => {
  const lines = text.trim().split('\n');
  const matches = [];
  
  lines.forEach((line, index) => {
    const parts = line.split(';').map(p => p.trim());
    if (parts.length >= 4) {
      const [dayMonth, opponent, competition, homeAway] = parts;
      const [day, month] = dayMonth.split('/').map(Number);
      
      if (day && month && opponent && competition) {
        const date = new Date(year, month - 1, day);
        matches.push({
          id: generateId(),
          date: date.toISOString().split('T')[0],
          opponent,
          competition,
          isHome: homeAway.toUpperCase() === 'C',
          played: false,
          goalsFor: 0,
          goalsAgainst: 0
        });
      }
    }
  });
  
  return matches;
};

// Export save as JSON
export const exportSaveAsJSON = (save) => {
  const dataStr = JSON.stringify(save, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${save.team.name}_${save.season}_backup.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// Import save from JSON
export const importSaveFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const save = JSON.parse(e.target.result);
        // Validate save structure
        if (!save.team || !save.coach || !save.season) {
          reject(new Error('Arquivo de save inválido'));
          return;
        }
        save.id = generateId(); // Generate new ID for imported save
        save.importedAt = new Date().toISOString();
        resolve(save);
      } catch (error) {
        reject(new Error('Erro ao ler arquivo JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};

// Get tactic statistics
export const getTacticStats = (matches) => {
  const stats = {};
  
  matches.filter(m => m.played && m.tactic).forEach(m => {
    if (!stats[m.tactic]) {
      stats[m.tactic] = { wins: 0, draws: 0, losses: 0, total: 0 };
    }
    
    stats[m.tactic].total++;
    
    if (m.goalsFor > m.goalsAgainst) stats[m.tactic].wins++;
    else if (m.goalsFor < m.goalsAgainst) stats[m.tactic].losses++;
    else stats[m.tactic].draws++;
  });
  
  return stats;
};
