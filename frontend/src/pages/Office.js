import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EVENTS, getSeverityColor, getSeverityLabel } from '../data/events';
import { 
  Briefcase, 
  Dices,
  AlertTriangle,
  User,
  Calendar,
  History
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { PlayerAvatar } from '../components/ImageFallback';
import { formatDate } from '../utils/helpers';
import { toast } from 'sonner';

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
        <span className="text-xs text-zinc-500">Punição: {event.punishment}</span>
        {event.createdAt && (
          <span className="text-xs text-zinc-600">{formatDate(event.createdAt)}</span>
        )}
      </div>
    </div>
  );
};

const EventResultModal = ({ event, player, onClose }) => {
  const colors = getSeverityColor(event.severity);
  
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
          {/* Player */}
          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded">
            <PlayerAvatar src={player?.photo} name={player?.name} size="lg" />
            <div>
              <p className="font-heading font-bold text-xl text-gold">{player?.name}</p>
              <p className="text-sm text-zinc-500">{player?.position} • {player?.overall} OVR</p>
            </div>
          </div>
          
          {/* Description */}
          <div className="p-4 bg-zinc-900/30 rounded">
            <p className="text-zinc-300">{event.description}</p>
          </div>
          
          {/* Punishment */}
          <div className={`p-4 rounded ${colors.bg} border ${colors.border}`}>
            <p className="font-heading uppercase tracking-wider text-xs text-zinc-500 mb-1">
              Punição Aplicada
            </p>
            <p className={`font-heading font-bold text-lg ${colors.text}`}>
              {event.punishment}
            </p>
          </div>
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
  const { currentSave, addEvent } = useGame();
  const [generatedEvent, setGeneratedEvent] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const players = currentSave?.players || [];
  const pastEvents = currentSave?.events || [];

  const handleGenerateEvent = () => {
    if (players.length === 0) {
      toast.error('Adicione jogadores ao elenco primeiro');
      return;
    }

    setIsGenerating(true);
    
    // Simulate some suspense
    setTimeout(() => {
      // Random event
      const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      
      // Random player
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      
      // Record the event
      const eventRecord = {
        ...randomEvent,
        playerId: randomPlayer.id,
        playerName: randomPlayer.name,
      };
      
      addEvent(eventRecord);
      
      setGeneratedEvent(randomEvent);
      setSelectedPlayer(randomPlayer);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCloseResult = () => {
    setGeneratedEvent(null);
    setSelectedPlayer(null);
  };

  // Group events by severity
  const criticalEvents = pastEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
  const recentEvents = pastEvents.slice(-10).reverse();

  return (
    <div className="space-y-6 animate-fade-in" data-testid="office-page">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
          Escritório
        </h1>
        <p className="text-zinc-500">Gerencie eventos e incidentes do elenco</p>
      </div>

      {/* Event Generator */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-gold/20">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <Dices className={`w-10 h-10 text-gold ${isGenerating ? 'animate-spin' : ''}`} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white mb-2">
            Gerador de Eventos
          </h2>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">
            Gere um evento aleatório que afetará um jogador do seu elenco. 
            Os eventos variam de situações leves a incidentes críticos.
          </p>
          <Button
            data-testid="generate-event-btn"
            onClick={handleGenerateEvent}
            disabled={isGenerating || players.length === 0}
            className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest px-8 py-6 text-lg gold-glow-hover disabled:opacity-50"
          >
            <Dices className={`w-6 h-6 mr-3 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Gerando...' : 'Gerar Evento'}
          </Button>
          {players.length === 0 && (
            <p className="text-orange-400 text-sm mt-4">
              Adicione jogadores ao elenco para gerar eventos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-white">{pastEvents.length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total de Eventos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-blood">{pastEvents.filter(e => e.severity === 'critical').length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Críticos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-orange-400">{pastEvents.filter(e => e.severity === 'high').length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Alta Gravidade</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-green-400">{pastEvents.filter(e => e.severity === 'positive').length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Positivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Event History */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <History className="w-5 h-5" />
              Eventos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, i) => {
                    const player = players.find(p => p.id === event.playerId);
                    return (
                      <EventCard key={`${event.id}-${i}`} event={event} player={player} />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Nenhum evento registrado</p>
                    <p className="text-zinc-600 text-sm mt-1">Gere seu primeiro evento!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Critical Events */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-blood/20">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-blood uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Incidentes Graves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {criticalEvents.length > 0 ? (
                  criticalEvents.map((event, i) => {
                    const player = players.find(p => p.id === event.playerId);
                    return (
                      <EventCard key={`critical-${event.id}-${i}`} event={event} player={player} />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Nenhum incidente grave</p>
                    <p className="text-zinc-600 text-sm mt-1">Mantenha assim!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Event Result Modal */}
      {generatedEvent && selectedPlayer && (
        <EventResultModal 
          event={generatedEvent} 
          player={selectedPlayer} 
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
};

export default Office;
