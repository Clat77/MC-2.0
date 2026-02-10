import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, generateId } from '../utils/helpers';

const GameContext = createContext(null);

const initialState = {
  saves: [],
  currentSaveId: null,
};

export const GameProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const data = storage.get();
    if (data && data.saves && Array.isArray(data.saves)) {
      setState({
        saves: data.saves,
        currentSaveId: data.currentSaveId || null,
      });
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      storage.set(state);
    }
  }, [state, loading]);

  // Get current save
  const currentSave = state.saves.find(s => s.id === state.currentSaveId) || null;

  // Create new save
  const createSave = useCallback((saveData) => {
    const newSave = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...saveData,
      players: [],
      matches: [],
      trophies: [],
      events: [],
      seasonHistory: [],
    };

    setState(prev => ({
      ...prev,
      saves: [...prev.saves, newSave],
      currentSaveId: newSave.id,
    }));

    return newSave;
  }, []);

  // Load save
  const loadSave = useCallback((saveId) => {
    setState(prev => ({
      ...prev,
      currentSaveId: saveId,
    }));
  }, []);

  // Delete save
  const deleteSave = useCallback((saveId) => {
    setState(prev => ({
      ...prev,
      saves: prev.saves.filter(s => s.id !== saveId),
      currentSaveId: prev.currentSaveId === saveId ? null : prev.currentSaveId,
    }));
  }, []);

  // Import save
  const importSave = useCallback((saveData) => {
    const importedSave = {
      ...saveData,
      id: generateId(),
      importedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      saves: [...prev.saves, importedSave],
      currentSaveId: importedSave.id,
    }));

    return importedSave;
  }, []);

  // Update current save
  const updateSave = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      saves: prev.saves.map(s => 
        s.id === prev.currentSaveId 
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  }, []);

  // Exit to main menu
  const exitSave = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSaveId: null,
    }));
  }, []);

  // Player management
  const addPlayer = useCallback((player) => {
    const newPlayer = {
      id: generateId(),
      ...player,
      games: 0,
      goals: 0,
      assists: 0,
      ratings: [],
      isCaptain: false,
      isViceCaptain: false,
      createdAt: new Date().toISOString(),
    };

    updateSave({
      players: [...(currentSave?.players || []), newPlayer],
    });

    return newPlayer;
  }, [currentSave, updateSave]);

  const updatePlayer = useCallback((playerId, updates) => {
    updateSave({
      players: (currentSave?.players || []).map(p =>
        p.id === playerId ? { ...p, ...updates } : p
      ),
    });
  }, [currentSave, updateSave]);

  const deletePlayer = useCallback((playerId) => {
    updateSave({
      players: (currentSave?.players || []).filter(p => p.id !== playerId),
    });
  }, [currentSave, updateSave]);

  // Match management
  const addMatch = useCallback((match) => {
    const newMatch = {
      id: generateId(),
      ...match,
      played: false,
      goalsFor: 0,
      goalsAgainst: 0,
      playerRatings: {},
      createdAt: new Date().toISOString(),
    };

    updateSave({
      matches: [...(currentSave?.matches || []), newMatch],
    });

    return newMatch;
  }, [currentSave, updateSave]);

  const addMatches = useCallback((matches) => {
    const newMatches = matches.map(m => ({
      id: generateId(),
      ...m,
      played: false,
      goalsFor: 0,
      goalsAgainst: 0,
      playerRatings: {},
      createdAt: new Date().toISOString(),
    }));

    updateSave({
      matches: [...(currentSave?.matches || []), ...newMatches],
    });

    return newMatches;
  }, [currentSave, updateSave]);

  const updateMatch = useCallback((matchId, updates) => {
    updateSave({
      matches: (currentSave?.matches || []).map(m =>
        m.id === matchId ? { ...m, ...updates } : m
      ),
    });
  }, [currentSave, updateSave]);

  const deleteMatch = useCallback((matchId) => {
    updateSave({
      matches: (currentSave?.matches || []).filter(m => m.id !== matchId),
    });
  }, [currentSave, updateSave]);

  // Record match result
  const recordMatchResult = useCallback((matchId, result) => {
    const { goalsFor, goalsAgainst, tactic, playerRatings, scorers, assisters, startingXI } = result;
    
    // Update match
    updateMatch(matchId, {
      played: true,
      goalsFor,
      goalsAgainst,
      tactic,
      playerRatings,
      scorers,
      assisters,
      startingXI,
      playedAt: new Date().toISOString(),
    });

    // Update player stats
    const updatedPlayers = (currentSave?.players || []).map(player => {
      const rating = playerRatings?.[player.id];
      const goalsScored = scorers?.filter(s => s === player.id).length || 0;
      const assistsMade = assisters?.filter(a => a === player.id).length || 0;
      const wasStarter = startingXI?.includes(player.id);
      
      if (rating !== undefined || wasStarter) {
        return {
          ...player,
          games: player.games + 1,
          goals: player.goals + goalsScored,
          assists: (player.assists || 0) + assistsMade,
          ratings: [...(player.ratings || []), rating || 6],
        };
      }
      return player;
    });

    updateSave({ players: updatedPlayers });
  }, [currentSave, updateMatch, updateSave]);

  // Trophy management
  const addTrophy = useCallback((trophy) => {
    const newTrophy = {
      id: generateId(),
      ...trophy,
      wonAt: new Date().toISOString(),
    };

    updateSave({
      trophies: [...(currentSave?.trophies || []), newTrophy],
    });

    return newTrophy;
  }, [currentSave, updateSave]);

  // Event management
  const addEvent = useCallback((event) => {
    const newEvent = {
      id: generateId(),
      ...event,
      createdAt: new Date().toISOString(),
    };

    updateSave({
      events: [...(currentSave?.events || []), newEvent],
    });

    return newEvent;
  }, [currentSave, updateSave]);

  // End season
  const endSeason = useCallback(() => {
    const currentPlayers = currentSave?.players || [];
    const currentMatches = currentSave?.matches || [];
    
    // Calculate season stats
    const played = currentMatches.filter(m => m.played);
    const wins = played.filter(m => m.goalsFor > m.goalsAgainst).length;
    const draws = played.filter(m => m.goalsFor === m.goalsAgainst).length;
    const losses = played.filter(m => m.goalsFor < m.goalsAgainst).length;
    const goalsFor = played.reduce((sum, m) => sum + m.goalsFor, 0);
    const goalsAgainst = played.reduce((sum, m) => sum + m.goalsAgainst, 0);
    
    const seasonHistory = {
      season: currentSave?.season,
      stats: { played: played.length, wins, draws, losses, goalsFor, goalsAgainst },
      trophies: currentSave?.trophies || [],
      topScorer: currentPlayers.sort((a, b) => b.goals - a.goals)[0]?.name,
      archivedAt: new Date().toISOString(),
    };

    // Reset season stats but keep historical badges
    const resetPlayers = currentPlayers.map(p => {
      const avgRating = p.ratings?.length > 0 
        ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length 
        : 0;
      
      // Determine if player earned a badge this season
      let badge = p.badge || null;
      if (p.games > 100 && avgRating > 7.5) badge = 'lenda';
      else if (p.games > 50 && (avgRating > 7.0 || p.goals > 30)) badge = 'idolo';
      
      return {
        ...p,
        seasonGoals: p.goals, // Archive
        seasonGames: p.games,
        seasonRatings: p.ratings,
        goals: 0,
        games: 0,
        ratings: [],
        badge,
      };
    });

    // Increment season year
    const [startYear] = currentSave?.season?.split('/') || ['2025'];
    const newStartYear = parseInt(startYear) + 1;
    const newSeason = `${newStartYear}/${(newStartYear + 1).toString().slice(-2)}`;

    updateSave({
      season: newSeason,
      players: resetPlayers,
      matches: [],
      trophies: [],
      seasonHistory: [...(currentSave?.seasonHistory || []), seasonHistory],
    });
  }, [currentSave, updateSave]);

  // Set captain/vice-captain
  const setCaptain = useCallback((playerId) => {
    updateSave({
      players: (currentSave?.players || []).map(p => ({
        ...p,
        isCaptain: p.id === playerId,
        isViceCaptain: p.id === playerId ? false : p.isViceCaptain,
      })),
    });
  }, [currentSave, updateSave]);

  const setViceCaptain = useCallback((playerId) => {
    updateSave({
      players: (currentSave?.players || []).map(p => ({
        ...p,
        isViceCaptain: p.id === playerId,
        isCaptain: p.id === playerId ? false : p.isCaptain,
      })),
    });
  }, [currentSave, updateSave]);

  const value = {
    // State
    saves: state.saves,
    currentSave,
    loading,
    
    // Save management
    createSave,
    loadSave,
    deleteSave,
    importSave,
    updateSave,
    exitSave,
    
    // Player management
    addPlayer,
    updatePlayer,
    deletePlayer,
    setCaptain,
    setViceCaptain,
    
    // Match management
    addMatch,
    addMatches,
    updateMatch,
    deleteMatch,
    recordMatchResult,
    
    // Trophy management
    addTrophy,
    
    // Event management
    addEvent,
    
    // Season management
    endSeason,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
