import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { NEWSPAPER_HEADLINES } from '../data/constants';
import { 
  getFormArray, 
  checkSquadDepth, 
  checkRivalries, 
  getNextMatch, 
  getDaysUntil,
  formatDateLong 
} from '../utils/helpers';
import { 
  RefreshCw, 
  AlertTriangle, 
  Calendar,
  Skull,
  Baby,
  Users,
  Trophy,
  TrendingUp,
  Target,
  Newspaper
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { TeamLogo } from '../components/ImageFallback';

const NewspaperCard = ({ team, coach, onRefresh }) => {
  const [headline, setHeadline] = useState(() => {
    const template = NEWSPAPER_HEADLINES[Math.floor(Math.random() * NEWSPAPER_HEADLINES.length)];
    return template.replace('{team}', team).replace('{coach}', coach);
  });

  const generateNewHeadline = () => {
    const template = NEWSPAPER_HEADLINES[Math.floor(Math.random() * NEWSPAPER_HEADLINES.length)];
    setHeadline(template.replace('{team}', team).replace('{coach}', coach));
    onRefresh?.();
  };

  return (
    <Card className="newspaper-bg border-none relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-amber-800" />
              <span className="font-heading uppercase tracking-[0.3em] text-xs text-amber-800">
                Gazeta Esportiva
              </span>
            </div>
            <h2 className="font-accent text-2xl md:text-3xl text-zinc-900 leading-tight">
              "{headline}"
            </h2>
            <p className="text-xs text-zinc-600 mt-3 font-body">
              Edição de hoje • Exclusivo
            </p>
          </div>
          <Button
            data-testid="refresh-headline-btn"
            variant="ghost"
            size="icon"
            onClick={generateNewHeadline}
            className="text-amber-800 hover:bg-amber-200/50"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FormDisplay = ({ form }) => {
  if (!form || form.length === 0) {
    return (
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-xs text-zinc-600">-</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {form.map((result, i) => (
        <div
          key={i}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm
            ${result === 'V' ? 'bg-green-500 text-white' : ''}
            ${result === 'E' ? 'bg-zinc-500 text-white' : ''}
            ${result === 'D' ? 'bg-red-500 text-white' : ''}
          `}
        >
          {result}
        </div>
      ))}
      {[...Array(Math.max(0, 5 - form.length))].map((_, i) => (
        <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-xs text-zinc-600">-</span>
        </div>
      ))}
    </div>
  );
};

const NextMatchCard = ({ match }) => {
  if (!match) {
    return (
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próxima Partida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 text-sm">Nenhuma partida agendada</p>
        </CardContent>
      </Card>
    );
  }

  const daysUntil = getDaysUntil(match.date);

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-gold/20 gold-glow">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg text-gold uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Próxima Partida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-xl text-white">
              {match.isHome ? 'vs' : '@'} {match.opponent}
            </p>
            <p className="text-sm text-zinc-500">{match.competition}</p>
          </div>
          {daysUntil !== null && (
            <div className="text-right">
              <p className="text-3xl font-heading font-bold text-gold">{daysUntil}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">dias</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <Badge variant={match.isHome ? 'default' : 'secondary'} className={match.isHome ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-300'}>
            {match.isHome ? 'Casa' : 'Fora'}
          </Badge>
          <span className="text-zinc-500">{formatDateLong(match.date)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertsCard = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-orange-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg text-orange-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {alert.icon}
            <span className="text-zinc-300">{alert.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'gold' }) => (
  <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5 hover:border-gold/20 transition-all">
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded flex items-center justify-center bg-${color}/10`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-heading font-bold ${color === 'gold' ? 'text-gold' : `text-${color}-400`}`}>
          {value}
        </p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-xs text-zinc-600">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

const RivalriesCard = ({ rivalries }) => {
  if (rivalries.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider">
          Rivalidades Ativas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rivalries.map((rivalry, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded bg-zinc-900/50">
            {rivalry.type === 'carrasco' ? (
              <Skull className="w-6 h-6 text-blood" />
            ) : (
              <Baby className="w-6 h-6 text-green-400" />
            )}
            <div className="flex-1">
              <p className="font-heading font-semibold text-white">{rivalry.opponent}</p>
              <p className="text-xs text-zinc-500">
                {rivalry.type === 'carrasco' ? 'Carrasco - 3 derrotas seguidas' : 'Freguês - 3 vitórias seguidas'}
              </p>
            </div>
            <Badge className={rivalry.type === 'carrasco' ? 'bg-blood/20 text-red-400 border-blood/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}>
              {rivalry.type === 'carrasco' ? 'Carrasco' : 'Freguês'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const { currentSave } = useGame();

  const form = useMemo(() => getFormArray(currentSave?.matches || []), [currentSave?.matches]);
  const nextMatch = useMemo(() => getNextMatch(currentSave?.matches || []), [currentSave?.matches]);
  const weakPositions = useMemo(() => checkSquadDepth(currentSave?.players || []), [currentSave?.players]);
  const rivalries = useMemo(() => checkRivalries(currentSave?.matches || []), [currentSave?.matches]);

  // Calculate stats
  const playedMatches = (currentSave?.matches || []).filter(m => m.played);
  const wins = playedMatches.filter(m => m.goalsFor > m.goalsAgainst).length;
  const draws = playedMatches.filter(m => m.goalsFor === m.goalsAgainst).length;
  const losses = playedMatches.filter(m => m.goalsFor < m.goalsAgainst).length;
  const goalsFor = playedMatches.reduce((sum, m) => sum + m.goalsFor, 0);
  const goalsAgainst = playedMatches.reduce((sum, m) => sum + m.goalsAgainst, 0);
  const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;

  // Build alerts
  const alerts = [];
  if (weakPositions.length > 0) {
    alerts.push({
      icon: <Users className="w-5 h-5 text-orange-400" />,
      message: `Falta de profundidade: ${weakPositions.join(', ')}`,
    });
  }
  rivalries.filter(r => r.type === 'carrasco').forEach(r => {
    alerts.push({
      icon: <Skull className="w-5 h-5 text-blood" />,
      message: `${r.opponent} é seu carrasco!`,
    });
  });

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      {/* Team Header */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-zinc-900/50 to-transparent rounded border-l-4 border-gold">
        <TeamLogo 
          src={currentSave?.team?.logo} 
          name={currentSave?.team?.name} 
          size="xl" 
        />
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-tight">
            {currentSave?.team?.name}
          </h1>
          <p className="text-zinc-400 mt-1">
            Técnico: <span className="text-gold">{currentSave?.coach?.name}</span>
          </p>
          <Badge className="mt-2 bg-gold/20 text-gold border-gold/30 font-heading tracking-wider">
            {currentSave?.season}
          </Badge>
        </div>
      </div>

      {/* Newspaper Headline */}
      <NewspaperCard 
        team={currentSave?.team?.name || 'Time'} 
        coach={currentSave?.coach?.name || 'Técnico'} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Jogos" value={playedMatches.length} icon={Target} />
        <StatsCard 
          title="Vitórias" 
          value={wins} 
          subtitle={`${draws}E ${losses}D`}
          icon={Trophy} 
          color="green"
        />
        <StatsCard 
          title="Aproveitamento" 
          value={`${winRate}%`} 
          icon={TrendingUp} 
        />
        <StatsCard 
          title="Saldo" 
          value={goalsFor - goalsAgainst > 0 ? `+${goalsFor - goalsAgainst}` : goalsFor - goalsAgainst} 
          subtitle={`${goalsFor} GP / ${goalsAgainst} GC`}
          icon={Target}
          color={goalsFor >= goalsAgainst ? 'green' : 'red'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form & Next Match */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider">
                Últimos 5 Jogos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormDisplay form={form} />
            </CardContent>
          </Card>

          <NextMatchCard match={nextMatch} />
        </div>

        {/* Alerts & Rivalries */}
        <div className="space-y-6">
          <AlertsCard alerts={alerts} />
          <RivalriesCard rivalries={rivalries} />
          
          {alerts.length === 0 && rivalries.length === 0 && (
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gold mx-auto mb-4" />
                <p className="text-zinc-400">
                  Tudo tranquilo! Foque nos treinos e nas próximas partidas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Season Progress */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider">
            Progresso da Temporada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Jogos disputados</span>
            <span className="text-gold font-heading">{playedMatches.length} / {(currentSave?.matches || []).length || 0}</span>
          </div>
          <Progress 
            value={(currentSave?.matches || []).length > 0 
              ? (playedMatches.length / (currentSave?.matches || []).length) * 100 
              : 0
            } 
            className="h-2 bg-zinc-800"
          />
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-white/5">
            <div>
              <p className="text-2xl font-heading font-bold text-green-400">{wins}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Vitórias</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-zinc-400">{draws}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Empates</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-red-400">{losses}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Derrotas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
