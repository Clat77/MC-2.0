import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { COMPETITIONS, TACTICS } from '../data/constants';
import { getTacticStats, formatDate } from '../utils/helpers';
import { 
  Plus, 
  Swords,
  Trophy,
  Target,
  TrendingUp,
  Skull,
  Baby,
  ChevronDown,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const MatchResultBadge = ({ goalsFor, goalsAgainst }) => {
  if (goalsFor > goalsAgainst) {
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">V</Badge>;
  }
  if (goalsFor < goalsAgainst) {
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">D</Badge>;
  }
  return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">E</Badge>;
};

const MatchRow = ({ match, onRegister }) => {
  return (
    <TableRow className="hover:bg-white/5 border-white/5">
      <TableCell className="text-zinc-400">{formatDate(match.date)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-white">{match.opponent}</span>
          {match.rivalryType === 'carrasco' && <Skull className="w-4 h-4 text-blood" />}
          {match.rivalryType === 'fregues' && <Baby className="w-4 h-4 text-green-400" />}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-heading text-xs">
          {match.competition}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={match.isHome ? 'default' : 'secondary'} 
          className={match.isHome ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-300'}>
          {match.isHome ? 'C' : 'F'}
        </Badge>
      </TableCell>
      <TableCell>
        {match.played ? (
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl text-white">
              {match.goalsFor} - {match.goalsAgainst}
            </span>
            <MatchResultBadge goalsFor={match.goalsFor} goalsAgainst={match.goalsAgainst} />
          </div>
        ) : (
          <span className="text-zinc-600">-</span>
        )}
      </TableCell>
      <TableCell className="text-zinc-500 text-sm">{match.tactic || '-'}</TableCell>
      <TableCell>
        {!match.played && (
          <Button
            data-testid={`register-match-${match.id}`}
            size="sm"
            onClick={() => onRegister(match)}
            className="bg-gold hover:bg-gold-dim text-black font-heading uppercase tracking-widest text-xs"
          >
            Registrar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const TacticStatsCard = ({ tacticStats }) => {
  const entries = Object.entries(tacticStats);
  
  if (entries.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Nenhuma estatística de tática disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Estatísticas por Tática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map(([tactic, stats]) => {
          const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
          return (
            <div key={tactic} className="p-3 bg-zinc-900/50 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-white">{tactic}</span>
                <span className="text-gold font-heading">{winRate}%</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">{stats.wins}V</span>
                <span className="text-zinc-400">{stats.draws}E</span>
                <span className="text-red-400">{stats.losses}D</span>
                <span className="text-zinc-500">({stats.total} jogos)</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const RivalryStats = ({ matches }) => {
  const opponentStats = useMemo(() => {
    const stats = {};
    matches.filter(m => m.played).forEach(m => {
      if (!stats[m.opponent]) {
        stats[m.opponent] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
      }
      stats[m.opponent].goalsFor += m.goalsFor;
      stats[m.opponent].goalsAgainst += m.goalsAgainst;
      if (m.goalsFor > m.goalsAgainst) stats[m.opponent].wins++;
      else if (m.goalsFor < m.goalsAgainst) stats[m.opponent].losses++;
      else stats[m.opponent].draws++;
    });
    return stats;
  }, [matches]);

  const entries = Object.entries(opponentStats).sort((a, b) => 
    (b[1].wins + b[1].draws + b[1].losses) - (a[1].wins + a[1].draws + a[1].losses)
  );

  if (entries.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Confrontos Diretos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {entries.slice(0, 10).map(([opponent, stats]) => {
              const total = stats.wins + stats.draws + stats.losses;
              const isCarrasco = stats.losses >= 3 && stats.losses > stats.wins;
              const isFregues = stats.wins >= 3 && stats.wins > stats.losses;
              
              return (
                <div key={opponent} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-white">{opponent}</span>
                    {isCarrasco && <Skull className="w-4 h-4 text-blood" />}
                    {isFregues && <Baby className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">{stats.wins}V</span>
                    <span className="text-zinc-400">{stats.draws}E</span>
                    <span className="text-red-400">{stats.losses}D</span>
                    <span className="text-zinc-600">
                      {stats.goalsFor}-{stats.goalsAgainst}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export const Matches = () => {
  const { currentSave, recordMatchResult } = useGame();
  const [registerDialog, setRegisterDialog] = useState(null);
  const [resultData, setResultData] = useState({
    goalsFor: 0,
    goalsAgainst: 0,
    tactic: '',
    playerRatings: {},
    scorers: [],
    assisters: [],
    startingXI: [],
  });

  const matches = currentSave?.matches || [];
  const players = currentSave?.players || [];
  const tacticStats = useMemo(() => getTacticStats(matches), [matches]);

  const playedMatches = matches.filter(m => m.played);
  const upcomingMatches = matches.filter(m => !m.played);

  const handleOpenRegister = (match) => {
    setRegisterDialog(match);
    setResultData({
      goalsFor: 0,
      goalsAgainst: 0,
      tactic: '',
      playerRatings: {},
      scorers: [],
      assisters: [],
      startingXI: [],
    });
  };

  const handleRegisterResult = () => {
    recordMatchResult(registerDialog.id, resultData);
    setRegisterDialog(null);
    toast.success('Resultado registrado!');
  };

  const handlePlayerRating = (playerId, rating) => {
    setResultData(prev => ({
      ...prev,
      playerRatings: { ...prev.playerRatings, [playerId]: rating },
    }));
  };

  const handleAddScorer = (playerId) => {
    setResultData(prev => ({
      ...prev,
      scorers: [...prev.scorers, playerId],
    }));
  };

  const handleRemoveScorer = (index) => {
    setResultData(prev => ({
      ...prev,
      scorers: prev.scorers.filter((_, i) => i !== index),
    }));
  };

  const handleAddAssister = (playerId) => {
    setResultData(prev => ({ ...prev, assisters: [...prev.assisters, playerId] }));
  };

  const handleRemoveAssister = (index) => {
    setResultData(prev => ({ ...prev, assisters: prev.assisters.filter((_, i) => i !== index) }));
  };

  const handleToggleStarter = (playerId) => {
    setResultData(prev => ({
      ...prev,
      startingXI: prev.startingXI.includes(playerId) 
        ? prev.startingXI.filter(id => id !== playerId)
        : prev.startingXI.length < 11 ? [...prev.startingXI, playerId] : prev.startingXI
    }));
  };

  // Stats
  const wins = playedMatches.filter(m => m.goalsFor > m.goalsAgainst).length;
  const draws = playedMatches.filter(m => m.goalsFor === m.goalsAgainst).length;
  const losses = playedMatches.filter(m => m.goalsFor < m.goalsAgainst).length;
  const goalsFor = playedMatches.reduce((sum, m) => sum + m.goalsFor, 0);
  const goalsAgainst = playedMatches.reduce((sum, m) => sum + m.goalsAgainst, 0);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="matches-page">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
          Partidas
        </h1>
        <p className="text-zinc-500">{playedMatches.length} jogos disputados</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-white">{playedMatches.length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Jogos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-green-400">{wins}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Vitórias</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-zinc-400">{draws}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Empates</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-red-400">{losses}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Derrotas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-gold">{goalsFor}-{goalsAgainst}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Saldo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for matches and stats */}
      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="matches" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Próximos ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Data</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Adversário</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Competição</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Local</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Placar</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Tática</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playedMatches.length > 0 ? (
                    [...playedMatches].reverse().map(match => (
                      <MatchRow key={match.id} match={match} onRegister={handleOpenRegister} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Nenhuma partida disputada</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Data</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Adversário</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Competição</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Local</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Placar</TableHead>
                    <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Tática</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                      <MatchRow key={match.id} match={match} onRegister={handleOpenRegister} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Nenhuma partida agendada</p>
                        <p className="text-zinc-600 text-sm mt-1">Adicione partidas no Calendário</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-2 gap-6">
            <TacticStatsCard tacticStats={tacticStats} />
            <RivalryStats matches={matches} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Register Result Dialog */}
      <Dialog open={!!registerDialog} onOpenChange={() => setRegisterDialog(null)}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-white uppercase tracking-wider">
              Registrar Resultado
            </DialogTitle>
          </DialogHeader>
          
          {registerDialog && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Match Info */}
                <div className="p-4 bg-zinc-900/50 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-lg text-white">
                        {registerDialog.isHome ? 'vs' : '@'} {registerDialog.opponent}
                      </p>
                      <p className="text-sm text-zinc-500">{registerDialog.competition}</p>
                    </div>
                    <p className="text-sm text-zinc-400">{formatDate(registerDialog.date)}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="space-y-2">
                  <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                    Placar
                  </Label>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 mb-2">{currentSave?.team?.name}</p>
                      <Input
                        data-testid="goals-for-input"
                        type="number"
                        min="0"
                        value={resultData.goalsFor}
                        onChange={(e) => setResultData(prev => ({ ...prev, goalsFor: parseInt(e.target.value) || 0 }))}
                        className="w-20 text-center text-2xl font-heading bg-black/50 border-white/10 text-white"
                      />
                    </div>
                    <span className="text-2xl text-zinc-500">-</span>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 mb-2">{registerDialog.opponent}</p>
                      <Input
                        data-testid="goals-against-input"
                        type="number"
                        min="0"
                        value={resultData.goalsAgainst}
                        onChange={(e) => setResultData(prev => ({ ...prev, goalsAgainst: parseInt(e.target.value) || 0 }))}
                        className="w-20 text-center text-2xl font-heading bg-black/50 border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Tactic */}
                <div className="space-y-2">
                  <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                    Tática Utilizada
                  </Label>
                  <Select
                    value={resultData.tactic}
                    onValueChange={(value) => setResultData(prev => ({ ...prev, tactic: value }))}
                  >
                    <SelectTrigger data-testid="tactic-select" className="bg-black/50 border-white/10 text-white">
                      <SelectValue placeholder="Selecione a tática" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {TACTICS.map(tactic => (
                        <SelectItem key={tactic} value={tactic} className="text-white hover:bg-gold/10">
                          {tactic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scorers */}
                {resultData.goalsFor > 0 && players.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Artilheiros ({resultData.scorers.length}/{resultData.goalsFor})
                    </Label>
                    <Select
                      disabled={resultData.scorers.length >= resultData.goalsFor}
                      onValueChange={handleAddScorer}
                    >
                      <SelectTrigger className="bg-black/50 border-white/10 text-white">
                        <SelectValue placeholder="Adicionar goleador" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {players.map(player => (
                          <SelectItem key={player.id} value={player.id} className="text-white hover:bg-gold/10">
                            {player.name} ({player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {resultData.scorers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resultData.scorers.map((scorerId, index) => {
                          const player = players.find(p => p.id === scorerId);
                          return (
                            <Badge 
                              key={index}
                              className="bg-gold/20 text-gold border-gold/30 cursor-pointer hover:bg-red-500/20 hover:text-red-400"
                              onClick={() => handleRemoveScorer(index)}
                            >
                              ⚽ {player?.name} ×
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Player Ratings */}
                {players.length > 0 && (
                  <div className="space-y-3">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Notas dos Jogadores
                    </Label>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {players.slice(0, 11).map(player => (
                        <div key={player.id} className="flex items-center gap-4 p-2 bg-zinc-900/30 rounded">
                          <span className="text-sm text-white min-w-[120px] truncate">{player.name}</span>
                          <Slider
                            value={[resultData.playerRatings[player.id] || 6]}
                            onValueChange={([value]) => handlePlayerRating(player.id, value)}
                            min={1}
                            max={10}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className={`font-heading font-bold w-8 text-right ${
                            (resultData.playerRatings[player.id] || 6) >= 7.5 ? 'text-green-400' :
                            (resultData.playerRatings[player.id] || 6) >= 6 ? 'text-gold' : 'text-red-400'
                          }`}>
                            {resultData.playerRatings[player.id] || 6}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setRegisterDialog(null)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              data-testid="save-result-btn"
              onClick={handleRegisterResult}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
            >
              <Save size={18} className="mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Matches;
