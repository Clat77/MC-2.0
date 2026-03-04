// frontend/src/pages/Office.js
import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { EVENTS, getSeverityColor, getSeverityLabel } from '../data/events';
import {
  Briefcase,
  Dices,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Newspaper,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { PlayerAvatar } from '../components/ImageFallback';
import { formatDate } from '../utils/helpers';
import { toast } from 'sonner';
import { callOfficeAI } from '../utils/aiClient';

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

const computeMoment = (matches = []) => {
  const played = matches.filter(m => m.played);
  const last5 = played.slice(-5);
  if (last5.length === 0) {
    return { vibe: "neutro", summary: "Sem jogos ainda — tudo aberto.", points: 0 };
  }

  let pts = 0;
  let gf = 0;
  let ga = 0;

  for (const m of last5) {
    gf += Number(m.goalsFor || 0);
    ga += Number(m.goalsAgainst || 0);
    if (m.goalsFor > m.goalsAgainst) pts += 3;
    else if (m.goalsFor === m.goalsAgainst) pts += 1;
  }

  const gd = gf - ga;

  let vibe = "neutro";
  if (pts >= 11) vibe = "muito boa";
  else if (pts >= 8) vibe = "boa";
  else if (pts <= 3) vibe = "péssima";
  else if (pts <= 5) vibe = "ruim";

  const summary = `Últimos ${last5.length} jogos: ${pts} pts, ${gf} GP, ${ga} GC (saldo ${gd}). Fase: ${vibe}.`;
  return { vibe, summary, points: pts, gf, ga, gd };
};

const EventCard = ({ event, player }) => {
  const colors = getSeverityColor(event.severity);

  return (
    <div className={`p-4 rounded border ${colors.bg} ${colors.border} transition-all`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {player && (
            <PlayerAvatar src={player.photo} name={player.name} size="sm" />
          )}
          <div>
            <p className="font-heading font-semibold text-white">{event.title}</p>
            {player && (
              <p className="text-sm text-zinc-400">{player.name}</p>
            )}
          </div>
        </div>
        <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
          {getSeverityLabel(event.severity)}
        </Badge>
      </div>

      <p className="text-sm text-zinc-300 mt-3">{event.description}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-zinc-500">Ação EA: {event.punishment || event.recommendedAction || '—'}</span>
        {event.createdAt && (
          <span className="text-xs text-zinc-600">{formatDate(event.createdAt)}</span>
        )}
      </div>
    </div>
  );
};

const EventResultModal = ({ event, player, onClose }) => {
  const colors = getSeverityColor(event.severity);
  const eaActions = event.eaActions || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`bg-[#0f0f0f] border-2 ${colors.border} max-w-md`}>
        <div className={`absolute inset-x-0 top-0 h-1 ${event.severity === 'critical' ? 'bg-blood' : event.severity === 'high' ? 'bg-red-500' : event.severity === 'positive' ? 'bg-green-500' : 'bg-orange-500'}`} />

        <DialogHeader className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
            <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
              {getSeverityLabel(event.severity)}
            </Badge>
          </div>
          <DialogTitle className="font-heading font-bold text-2xl text-white uppercase tracking-wider">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded">
            <PlayerAvatar src={player?.photo} name={player?.name} size="lg" />
            <div>
              <p className="font-heading font-bold text-xl text-gold">{player?.name || "Elenco"}</p>
              {player?.position && (
                <p className="text-sm text-zinc-500">{player.position} • {player.overall} OVR</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-zinc-900/30 rounded">
            <p className="text-zinc-300">{event.description}</p>
          </div>

          <div className={`p-4 rounded ${colors.bg} border ${colors.border}`}>
            <p className="font-heading uppercase tracking-wider text-xs text-zinc-500 mb-1">
              Ação recomendada (EA FC 26)
            </p>
            <p className={`font-heading font-bold text-lg ${colors.text}`}>
              {event.punishment || event.recommendedAction || '—'}
            </p>

            {eaActions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Outras opções</p>
                <div className="flex flex-wrap gap-2">
                  {eaActions.slice(0, 8).map((a, i) => (
                    <Badge key={i} className="bg-zinc-900/50 text-zinc-200 border border-white/10">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {event.headline && (
            <div className="p-4 rounded bg-amber-900/10 border border-amber-900/20">
              <p className="text-xs text-amber-200/70 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Newspaper className="w-4 h-4" /> Manchete
              </p>
              <p className="text-amber-100 font-heading font-bold">{event.headline}</p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={onClose}
            className="w-full bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const Office = () => {
  const { currentSave, addEvent, updateSave } = useGame();

  const [generatedEvent, setGeneratedEvent] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false);

  const [activePanel, setActivePanel] = useState("event"); // event | headlines | comms | chat
  const [selectedPastEventId, setSelectedPastEventId] = useState("");
  const [commsResult, setCommsResult] = useState(null);
  const [isGeneratingComms, setIsGeneratingComms] = useState(false);

  const [headlinesResult, setHeadlinesResult] = useState([]);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(() => currentSave?.aiChat || []);
  const [isChatting, setIsChatting] = useState(false);

  const players = currentSave?.players || [];
  const pastEvents = currentSave?.events || [];
  const matches = currentSave?.matches || [];

  const teamName = currentSave?.team?.name || "Seu Time";
  const coachName = currentSave?.coach?.name || "Técnico";

  const moment = useMemo(() => computeMoment(matches), [matches]);
  const nextMatchId = useMemo(() => getNextMatchId(matches), [matches]);

  // ✅ Limite só pro GERADOR DE EVENTO
  const aiEventUsage = currentSave?.aiEventUsage || {};
  const usedEventThisMatch = nextMatchId ? (aiEventUsage[nextMatchId] || 0) : 0;
  const remainingEvent = Math.max(0, 3 - usedEventThisMatch);

  const selectedPastEvent = useMemo(() => {
    return pastEvents.find(e => e.id === selectedPastEventId) || null;
  }, [pastEvents, selectedPastEventId]);

  const eventPlayer = (event) => {
    if (!event?.playerId) return null;
    return players.find(p => String(p.id) === String(event.playerId)) || null;
  };

  const buildAIContext = () => {
    // manda “quase tudo”, mas segura o tamanho do chat
    const safeSave = {
      ...currentSave,
      aiChat: (currentSave?.aiChat || []).slice(-20),
    };

    return {
      team: safeSave.team,
      coach: safeSave.coach,
      league: safeSave.league,
      season: safeSave.season,
      players: safeSave.players,
      matches: safeSave.matches,
      trophies: safeSave.trophies,
      events: safeSave.events,
      seasonHistory: safeSave.seasonHistory,
      moment,
      ui: {
        screen: "office",
        teamName,
        coachName,
        nextMatchId,
      },
    };
  };

  const incrementEventUsage = () => {
    if (!nextMatchId) return; // se não tem próxima partida, não limita
    const updated = {
      ...(currentSave?.aiEventUsage || {}),
      [nextMatchId]: (currentSave?.aiEventUsage?.[nextMatchId] || 0) + 1,
    };
    updateSave({ ...currentSave, aiEventUsage: updated });
  };

  const generateEventFallback = () => {
    const eventTemplate = pickRandom(EVENTS);
    const randomPlayer = players.length > 0 ? pickRandom(players) : null;

    const newEvent = {
      id: Date.now(),
      title: eventTemplate.title,
      description: eventTemplate.description,
      severity: eventTemplate.severity,
      punishment: eventTemplate.punishment,
      playerId: randomPlayer?.id || null,
      createdAt: new Date().toISOString(),
      source: "fallback",
    };

    addEvent(newEvent);
    setGeneratedEvent(newEvent);
    setSelectedPlayer(randomPlayer);
    toast.success("Evento gerado (fallback)");
  };

  const generateEventWithAI = async () => {
    // ✅ limite só aqui
    if (nextMatchId && remainingEvent <= 0) {
      toast.error("Você já usou os 3 eventos de IA antes da próxima partida.");
      return;
    }

    if (players.length === 0) {
      toast.error("Cadastre jogadores primeiro pra IA conseguir gerar evento massa.");
      return;
    }

    setIsGeneratingEvent(true);

    try {
      const context = buildAIContext();
      const data = await callOfficeAI({
        task: "generate_event",
        payload: {},
        context,
        temperature: 0.9,
      });

      const parsed = data?.parsed;

      if (!parsed) {
        toast.error("A IA respondeu fora do formato. Vou gerar fallback.");
        generateEventFallback();
        return;
      }

      const involvedIds = Array.isArray(parsed.involvedPlayerIds) ? parsed.involvedPlayerIds.map(String) : [];
      let chosenPlayer =
        players.find(p => involvedIds.includes(String(p.id))) ||
        players.find(p => String(p.id) === String(involvedIds[0])) ||
        pickRandom(players);

      const newEvent = {
        id: Date.now(),
        title: parsed.title || "Evento do vestiário",
        description: parsed.description || "Aconteceu uma situação no elenco.",
        severity: parsed.severity || "low",
        punishment: parsed.recommendedAction || "Conversar e advertir",
        recommendedAction: parsed.recommendedAction || "Conversar e advertir",
        eaActions: Array.isArray(parsed.eaActions) ? parsed.eaActions : [],
        category: parsed.category || "elenco",
        headline: parsed.headline || null,
        playerId: chosenPlayer?.id || null,
        createdAt: new Date().toISOString(),
        source: "ai",
      };

      addEvent(newEvent);
      setGeneratedEvent(newEvent);
      setSelectedPlayer(chosenPlayer);

      // ✅ contabiliza uso só aqui
      incrementEventUsage();

      toast.success("Evento gerado com IA");
    } catch (err) {
      toast.error(`Deu ruim na IA: ${err.message}. Vou no fallback.`);
      generateEventFallback();
    } finally {
      setIsGeneratingEvent(false);
    }
  };

  const generateHeadlinesWithAI = async () => {
    setIsGeneratingHeadlines(true);
    try {
      const context = buildAIContext();
      const data = await callOfficeAI({
        task: "generate_headlines",
        payload: {},
        context,
        temperature: 0.8,
      });

      const parsed = data?.parsed;
      const headlines = parsed?.headlines;

      if (!Array.isArray(headlines) || headlines.length === 0) {
        toast.error("Não consegui gerar manchetes agora.");
        return;
      }

      setHeadlinesResult(headlines);

      // salva pro Dashboard usar
      updateSave({
        ...currentSave,
        aiHeadlines: headlines,
      });

      toast.success("Manchetes geradas e salvas pro Dashboard");
    } catch (err) {
      toast.error(`Deu ruim nas manchetes: ${err.message}`);
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };

  const generateCommsWithAI = async () => {
    if (!selectedPastEvent) {
      toast.error("Escolhe um evento do histórico primeiro.");
      return;
    }

    setIsGeneratingComms(true);
    setCommsResult(null);

    try {
      const context = buildAIContext();
      const data = await callOfficeAI({
        task: "generate_comms",
        payload: selectedPastEvent,
        context,
        temperature: 0.7,
      });

      const parsed = data?.parsed;
      if (!parsed?.internalNote || !parsed?.pressRelease) {
        toast.error("A IA não trouxe os comunicados certinho.");
        return;
      }

      setCommsResult(parsed);
      toast.success("Comunicados gerados");
    } catch (err) {
      toast.error(`Deu ruim no comunicado: ${err.message}`);
    } finally {
      setIsGeneratingComms(false);
    }
  };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;

    const newMessages = [
      ...(chatMessages || []),
      { role: "user", content: msg, createdAt: new Date().toISOString() },
    ];

    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);

    try {
      const context = buildAIContext();
      const data = await callOfficeAI({
        task: "chat",
        payload: { message: msg },
        context,
        temperature: 0.8,
      });

      const text = data?.text || "Não consegui responder agora.";

      const updated = [
        ...newMessages,
        { role: "assistant", content: text, createdAt: new Date().toISOString() },
      ];

      setChatMessages(updated);

      // salva no save (mantém só as últimas 40 msg pra não explodir)
      updateSave({
        ...currentSave,
        aiChat: updated.slice(-40),
      });
    } catch (err) {
      toast.error(`Deu ruim no chat: ${err.message}`);
    } finally {
      setIsChatting(false);
    }
  };

  const HistoryList = () => (
    <ScrollArea className="h-[340px] pr-3">
      <div className="space-y-3">
        {pastEvents.length === 0 && (
          <p className="text-zinc-500 text-sm">Nenhum evento ainda.</p>
        )}
        {pastEvents
          .slice()
          .reverse()
          .map((ev) => (
            <EventCard key={ev.id} event={ev} player={eventPlayer(ev)} />
          ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="office-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-gold" /> Escritório
          </h1>
          <p className="text-zinc-500">
            {teamName} • Técnico: {coachName}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            {moment.summary}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-zinc-900/50 text-zinc-200 border border-white/10">
            Eventos IA: {nextMatchId ? `${remainingEvent}/3 antes do próximo jogo` : "sem limite (sem próxima partida)"}
          </Badge>
        </div>
      </div>

      {/* NAV */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activePanel === "event" ? "default" : "outline"}
          onClick={() => setActivePanel("event")}
          className={activePanel === "event" ? "bg-gold text-black hover:bg-gold-dim" : ""}
        >
          <Dices className="w-4 h-4 mr-2" />
          Evento IA
        </Button>

        <Button
          variant={activePanel === "headlines" ? "default" : "outline"}
          onClick={() => setActivePanel("headlines")}
          className={activePanel === "headlines" ? "bg-gold text-black hover:bg-gold-dim" : ""}
        >
          <Newspaper className="w-4 h-4 mr-2" />
          Manchetes
        </Button>

        <Button
          variant={activePanel === "comms" ? "default" : "outline"}
          onClick={() => setActivePanel("comms")}
          className={activePanel === "comms" ? "bg-gold text-black hover:bg-gold-dim" : ""}
        >
          <FileText className="w-4 h-4 mr-2" />
          Comunicados
        </Button>

        <Button
          variant={activePanel === "chat" ? "default" : "outline"}
          onClick={() => setActivePanel("chat")}
          className={activePanel === "chat" ? "bg-gold text-black hover:bg-gold-dim" : ""}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat do Mister
        </Button>
      </div>

      {/* PANELS */}
      {activePanel === "event" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" /> Gerar evento com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded bg-zinc-900/40 border border-white/5">
                <p className="text-sm text-zinc-300">
                  A IA vai gerar um evento “forçável” no EA FC 26 (banco, não relacionar, lista de transferência, etc).
                  <br />
                  <span className="text-zinc-500 text-xs">
                    Limite: <b>3 eventos</b> antes do próximo jogo. O resto (chat/manchetes/comunicados) é ilimitado.
                  </span>
                </p>
              </div>

              <Button
                onClick={generateEventWithAI}
                disabled={isGeneratingEvent}
                className="w-full bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
              >
                {isGeneratingEvent ? "GERANDO..." : "GERAR EVENTO IA"}
              </Button>

              <Button
                onClick={generateEventFallback}
                variant="outline"
                className="w-full border-white/10 text-zinc-200"
              >
                Gerar fallback (sem IA)
              </Button>

              {nextMatchId && (
                <div className="text-xs text-zinc-500">
                  Próximo jogo ID: <span className="text-zinc-300">{String(nextMatchId)}</span> • usados:{" "}
                  <span className="text-zinc-300">{usedEventThisMatch}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Histórico do Escritório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryList />
            </CardContent>
          </Card>
        </div>
      )}

      {activePanel === "headlines" && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-300" /> Manchetes pro Dashboard (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-400">
              Gera 5 manchetes baseadas no momento do time e salva no seu save.
              O Dashboard vai usar essas manchetes automaticamente.
            </p>

            <Button
              onClick={generateHeadlinesWithAI}
              disabled={isGeneratingHeadlines}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
            >
              {isGeneratingHeadlines ? "GERANDO..." : "GERAR MANCHETES"}
            </Button>

            {headlinesResult.length > 0 && (
              <div className="space-y-2 pt-2">
                {headlinesResult.map((h, i) => (
                  <div key={i} className="p-3 rounded bg-amber-900/10 border border-amber-900/20 text-amber-100 font-heading font-semibold">
                    {h}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === "comms" && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" /> Comunicados (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-400">
              Escolhe um evento do histórico e a IA cria:
              <b> nota interna</b> (diretoria/elenco) e <b>nota oficial</b> (imprensa).
            </p>

            <div className="flex gap-2 flex-wrap items-center">
              <div className="min-w-[260px] flex-1">
                <Input
                  placeholder="Cole aqui o ID do evento (ou escolha no histórico)"
                  value={selectedPastEventId}
                  onChange={(e) => setSelectedPastEventId(e.target.value)}
                />
              </div>

              <Button
                onClick={generateCommsWithAI}
                disabled={isGeneratingComms}
                className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
              >
                {isGeneratingComms ? "GERANDO..." : "GERAR COMUNICADOS"}
              </Button>
            </div>

            {selectedPastEvent && (
              <div className="p-3 rounded bg-zinc-900/40 border border-white/5">
                <p className="text-white font-heading font-semibold">{selectedPastEvent.title}</p>
                <p className="text-zinc-400 text-sm">{selectedPastEvent.description}</p>
                <p className="text-zinc-600 text-xs mt-2">
                  {selectedPastEvent.createdAt ? formatDate(selectedPastEvent.createdAt) : ""}
                </p>
              </div>
            )}

            {commsResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded bg-zinc-900/40 border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Nota interna</p>
                  <p className="text-zinc-200 whitespace-pre-wrap">{commsResult.internalNote}</p>
                </div>

                <div className="p-3 rounded bg-zinc-900/40 border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Nota oficial</p>
                  <p className="text-zinc-200 whitespace-pre-wrap">{commsResult.pressRelease}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === "chat" && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold" /> Chat do Mister (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-400">
              Pergunta sobre tática, momento, jogadores, mercado… a IA responde no clima da fase do time.
            </p>

            <div className="p-3 rounded bg-zinc-900/40 border border-white/5">
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-3">
                  {(!chatMessages || chatMessages.length === 0) && (
                    <p className="text-zinc-500 text-sm">Manda uma pergunta aí, Teko.</p>
                  )}

                  {(chatMessages || []).map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border ${
                        m.role === "user"
                          ? "bg-gold/10 border-gold/20 text-zinc-100"
                          : "bg-zinc-900/40 border-white/5 text-zinc-200"
                      }`}
                    >
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        {m.role === "user" ? "Você" : "Assistente"}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ex: Tô tomando gol besta. Que ajuste tático eu faço? / Quem merece banco? / Vale vender fulano?"
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                onClick={sendChat}
                disabled={isChatting}
                className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
              >
                {isChatting ? "ENVIANDO..." : "ENVIAR"}
              </Button>

              <Button
                variant="outline"
                className="border-white/10 text-zinc-200"
                onClick={() => {
                  setChatMessages([]);
                  updateSave({ ...currentSave, aiChat: [] });
                  toast.success("Chat limpo");
                }}
              >
                Limpar chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedEvent && (
        <EventResultModal
          event={generatedEvent}
          player={selectedPlayer}
          onClose={() => setGeneratedEvent(null)}
        />
      )}
    </div>
  );
};

export default Office;