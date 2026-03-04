// frontend/src/pages/Dashboard.js
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
  Users,
  Trophy,
  TrendingUp,
  Target,
  Newspaper,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getNextMatchId = (matches = []) => {
  const unplayed = matches.filter(m => !m.played);
  if (unplayed.length === 0) return null;

  const sorted = [...unplayed].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : new Date(a.createdAt || 0).getTime();
    const db = b.date ? new Date(b.date).getTime() : new Date(b.createdAt || 0).getTime();
    return da - db;
  });

  return sorted[0]?.id || null;
};

const NewspaperCard = ({ team, coach, aiHeadlines, onRefresh }) => {
  const [headline, setHeadline] = useState(() => {
    if (Array.isArray(aiHeadlines) && aiHeadlines.length > 0) {
      return pickRandom(aiHeadlines);
    }
    const template = pickRandom(NEWSPAPER_HEADLINES);
    return template.replace('{team}', team).replace('{coach}', coach);
  });

  const generateNewHeadline = () => {
    if (Array.isArray(aiHeadlines) && aiHeadlines.length > 0) {
      setHeadline(pickRandom(aiHeadlines));
      onRefresh?.();
      return;
    }
    const template = pickRandom(NEWSPAPER_HEADLINES);
    setHeadline(template.replace('{team}', team).replace('{coach}', coach));
    onRefresh?.();
  };

  const badgeLabel = (Array.isArray(aiHeadlines) && aiHeadlines.length > 0) ? "IA" : "TEMPLATE";

  return (
    <Card className="newspaper-bg border-none relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-amber-800" />
              <span className="font-heading uppercase tracking-[0.3em] text-xs text-amber-900/80">NOTÍCIAS DO DIA</span>
              <Badge className="bg-amber-900/10 text-amber-900 border border-amber-900/20">{badgeLabel}</Badge>
            </div>
            <h3 className="font-heading font-black text-2xl text-amber-950 leading-tight">
              {headline}
            </h3>
            <p className="text-amber-900/70 text-sm mt-2">
              {team} • Técnico: {coach}
            </p>
          </div>

          <Button
            onClick={generateNewHeadline}
            variant="outline"
            className="border-amber-900/20 text-amber-950 hover:bg-amber-900/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const { currentSave } = useGame();

  const players = currentSave?.players || [];
  const matches = currentSave?.matches || [];
  const trophies = currentSave?.trophies || [];
  const events = currentSave?.events || [];

  const teamName = currentSave?.team?.name || 'Seu Time';
  const coachName = currentSave?.coach?.name || 'Técnico';

  const aiHeadlines = currentSave?.aiHeadlines || [];

  // ✅ contador só pro gerador de eventos IA
  const nextMatchId = useMemo(() => getNextMatchId(matches), [matches]);
  const aiEventUsage = currentSave?.aiEventUsage || {};
  const usedEventThisMatch = nextMatchId ? (aiEventUsage[nextMatchId] || 0) : 0;
  const remainingEvent = Math.max(0, 3 - usedEventThisMatch);

  const formArray = useMemo(() => getFormArray(matches), [matches]);
  const nextMatch = useMemo(() => getNextMatch(matches), [matches]);

  const squadDepth = useMemo(() => checkSquadDepth(players), [players]);
  const rivalries = useMemo(() => checkRivalries(matches), [matches]);

  const totalEvents = events.length;
  const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high').length;

  const trophiesWon = trophies.length;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <div>
        <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
          Dashboard
        </h1>
        <p className="text-zinc-500">Visão geral do seu modo carreira</p>
      </div>

      <NewspaperCard
        team={teamName}
        coach={coachName}
        aiHeadlines={aiHeadlines}
        onRefresh={() => {}}
      />

      {/* ✅ contador no topo */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> IA do Escritório
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white font-heading font-bold">
              Eventos IA disponíveis:{" "}
              <span className="text-gold">{nextMatchId ? `${remainingEvent}/3` : "∞"}</span>
            </p>
            <p className="text-xs text-zinc-500">
              {nextMatchId
                ? `Antes do próximo jogo (ID: ${String(nextMatchId)}).`
                : "Sem próxima partida cadastrada — sem limite."}
            </p>
          </div>

          <Badge className="bg-zinc-900/50 text-zinc-200 border border-white/10">
            Usados: {nextMatchId ? usedEventThisMatch : 0}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> Elenco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-white">{players.length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Jogadores cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Próximo Jogo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <>
                <p className="text-lg font-heading font-bold text-white">{nextMatch.opponent}</p>
                <p className="text-xs text-zinc-500">{formatDateLong(nextMatch.date)} • em {getDaysUntil(nextMatch.date)} dias</p>
              </>
            ) : (
              <p className="text-zinc-500">Sem jogo marcado</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Escritório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-white">{totalEvents}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{criticalEvents} graves/críticos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Títulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-white">{trophiesWon}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Conquistas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Forma recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {formArray.map((f, i) => (
                <Badge key={i} className={`px-3 py-1 ${f === 'W' ? 'bg-green-600/20 text-green-400 border border-green-500/20' : f === 'D' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/20' : 'bg-red-600/20 text-red-400 border border-red-500/20'}`}>
                  {f}
                </Badge>
              ))}
              {formArray.length === 0 && <p className="text-zinc-500">Sem jogos ainda</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" /> Profundidade do elenco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {squadDepth.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{d.position}</span>
                  <span className="text-zinc-500">{d.count} jogadores</span>
                </div>
                <Progress value={Math.min(100, d.count * 20)} />
              </div>
            ))}
            {squadDepth.length === 0 && <p className="text-zinc-500">Cadastre jogadores pra ver isso</p>}
          </CardContent>
        </Card>
      </div>

      {rivalries.length > 0 && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Skull className="w-5 h-5" /> Rivalidades / Clima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rivalries.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-zinc-300">{r.label}</span>
                  <Badge className="bg-red-600/20 text-red-400 border border-red-500/20">{r.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;