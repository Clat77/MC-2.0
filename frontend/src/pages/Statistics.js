import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp,
  Target,
  Users,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { getTacticStats } from '../utils/helpers';

const COLORS = {
  gold: '#D4AF37',
  goldDim: '#aa8c2c',
  green: '#22c55e',
  red: '#ef4444',
  zinc: '#71717a',
  blood: '#8a0303',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-gold/30 p-3 rounded shadow-lg">
        <p className="text-gold font-heading text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Results Distribution Pie Chart
const ResultsDistributionChart = ({ matches }) => {
  const data = useMemo(() => {
    const played = matches.filter(m => m.played);
    const wins = played.filter(m => m.goalsFor > m.goalsAgainst).length;
    const draws = played.filter(m => m.goalsFor === m.goalsAgainst).length;
    const losses = played.filter(m => m.goalsFor < m.goalsAgainst).length;
    
    return [
      { name: 'Vitórias', value: wins, color: COLORS.green },
      { name: 'Empates', value: draws, color: COLORS.zinc },
      { name: 'Derrotas', value: losses, color: COLORS.red },
    ].filter(d => d.value > 0);
  }, [matches]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-zinc-500">Nenhuma partida disputada</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Goals Over Time Chart
const GoalsTimelineChart = ({ matches }) => {
  const data = useMemo(() => {
    const played = matches
      .filter(m => m.played && m.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let cumulativeFor = 0;
    let cumulativeAgainst = 0;
    
    return played.map((m, index) => {
      cumulativeFor += m.goalsFor;
      cumulativeAgainst += m.goalsAgainst;
      return {
        jogo: `J${index + 1}`,
        opponent: m.opponent,
        goalsFor: m.goalsFor,
        goalsAgainst: m.goalsAgainst,
        totalFor: cumulativeFor,
        totalAgainst: cumulativeAgainst,
        saldo: cumulativeFor - cumulativeAgainst,
      };
    });
  }, [matches]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-zinc-500">Nenhuma partida disputada</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="jogo" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
        <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="totalFor" 
          name="Gols Marcados"
          stroke={COLORS.green} 
          fill={COLORS.green}
          fillOpacity={0.3}
        />
        <Area 
          type="monotone" 
          dataKey="totalAgainst" 
          name="Gols Sofridos"
          stroke={COLORS.red} 
          fill={COLORS.red}
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Tactics Win Rate Bar Chart
const TacticsBarChart = ({ matches }) => {
  const data = useMemo(() => {
    const stats = getTacticStats(matches);
    return Object.entries(stats).map(([tactic, s]) => ({
      name: tactic.split(' ')[0], // Abbreviated
      fullName: tactic,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      winRate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
    }));
  }, [matches]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-zinc-500">Nenhuma tática registrada</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis type="number" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
        <YAxis dataKey="name" type="category" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="wins" name="Vitórias" fill={COLORS.green} stackId="results" />
        <Bar dataKey="draws" name="Empates" fill={COLORS.zinc} stackId="results" />
        <Bar dataKey="losses" name="Derrotas" fill={COLORS.red} stackId="results" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Player Performance Chart
const PlayerPerformanceChart = ({ players }) => {
  const data = useMemo(() => {
    return players
      .filter(p => p.games > 0)
      .map(p => ({
        name: p.name.split(' ')[0],
        fullName: p.name,
        games: p.games,
        goals: p.goals,
        avgRating: p.ratings?.length > 0 
          ? parseFloat((p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length).toFixed(1))
          : 0,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
  }, [players]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-zinc-500">Nenhum jogador com partidas</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
        <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} domain={[0, 10]} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avgRating" name="Média" fill={COLORS.gold} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.avgRating >= 7.5 ? COLORS.green : entry.avgRating >= 6 ? COLORS.gold : COLORS.red}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Top Scorers Table
const TopScorersTable = ({ players }) => {
  const scorers = useMemo(() => {
    return players
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [players]);

  if (scorers.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500">Nenhum gol marcado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scorers.map((player, index) => (
        <div key={player.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded">
          <span className={`
            w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm
            ${index < 3 ? 'bg-gold/20 text-gold' : 'bg-zinc-800 text-zinc-400'}
          `}>
            {index + 1}
          </span>
          <div className="flex-1">
            <p className="font-heading text-white">{player.name}</p>
            <p className="text-xs text-zinc-500">{player.position} • {player.games} jogos</p>
          </div>
          <Badge className="bg-gold/20 text-gold border-gold/30 font-heading text-lg">
            {player.goals}
          </Badge>
        </div>
      ))}
    </div>
  );
};

// Main Statistics Page
export const Statistics = () => {
  const { currentSave } = useGame();
  
  const matches = currentSave?.matches || [];
  const players = currentSave?.players || [];
  const playedMatches = matches.filter(m => m.played);

  // Calculate overall stats
  const totalGoalsFor = playedMatches.reduce((sum, m) => sum + m.goalsFor, 0);
  const totalGoalsAgainst = playedMatches.reduce((sum, m) => sum + m.goalsAgainst, 0);
  const wins = playedMatches.filter(m => m.goalsFor > m.goalsAgainst).length;
  const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="statistics-page">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
          Estatísticas
        </h1>
        <p className="text-zinc-500">Análise detalhada da temporada</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-heading font-bold text-gold">{playedMatches.length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Jogos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-heading font-bold text-green-400">{winRate}%</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Aproveitamento</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-heading font-bold text-white">{totalGoalsFor}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Gols Marcados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-heading font-bold ${totalGoalsFor - totalGoalsAgainst >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGoalsFor - totalGoalsAgainst >= 0 ? '+' : ''}{totalGoalsFor - totalGoalsAgainst}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Saldo de Gols</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="results" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Resultados
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Gols
          </TabsTrigger>
          <TabsTrigger value="tactics" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Táticas
          </TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-gold data-[state=active]:text-black font-heading">
            Jogadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gold" />
                  Distribuição de Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsDistributionChart matches={matches} />
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  Artilheiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <TopScorersTable players={players} />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold" />
                Evolução de Gols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoalsTimelineChart matches={matches} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tactics">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-gold" />
                Desempenho por Tática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TacticsBarChart matches={matches} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                Média de Notas dos Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerPerformanceChart players={players} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
