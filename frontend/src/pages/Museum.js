import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { getPlayerBadge } from '../utils/helpers';
import { 
  Trophy, 
  Plus,
  Crown,
  Star,
  Award,
  History,
  AlertTriangle,
  User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { PlayerAvatar } from '../components/ImageFallback';
import { toast } from 'sonner';

import { LEAGUES } from '../data/constants';

const TROPHY_TYPES = [
  'Liga',
  'Copa Nacional',
  'Copa da Liga',
  'Champions League',
  'Europa League',
  'Conference League',
  'Supercopa',
  'Mundial de Clubes',
  'Outro'
];

const TrophyCard = ({ trophy }) => (
  <Card className="bg-gradient-to-br from-gold/10 to-transparent border-gold/30 hover:border-gold transition-all group">
    <CardContent className="p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Trophy className="w-8 h-8 text-gold" />
      </div>
      <h3 className="font-heading font-bold text-lg text-white">{trophy.name}</h3>
      <p className="text-sm text-zinc-500">{trophy.season}</p>
      <Badge className="mt-2 bg-gold/20 text-gold border-gold/30">
        {trophy.type}
      </Badge>
    </CardContent>
  </Card>
);

const HallOfFameCard = ({ player, badge }) => {
  const avgRating = player.ratings?.length > 0 
    ? (player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length).toFixed(1)
    : player.seasonRatings?.length > 0
      ? (player.seasonRatings.reduce((a, b) => a + b, 0) / player.seasonRatings.length).toFixed(1)
      : '-';

  return (
    <Card className={`
      bg-gradient-to-br border transition-all
      ${badge === 'lenda' 
        ? 'from-purple-500/10 to-transparent border-purple-500/30 hover:border-purple-500' 
        : 'from-gold/10 to-transparent border-gold/30 hover:border-gold'
      }
    `}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <PlayerAvatar src={player.photo} name={player.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-white">{player.name}</h3>
              {badge === 'lenda' ? (
                <Crown className="w-5 h-5 text-purple-400" />
              ) : (
                <Star className="w-5 h-5 text-gold" />
              )}
            </div>
            <p className="text-sm text-zinc-500">{player.position}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-zinc-400">{player.games || player.seasonGames || 0} jogos</span>
              <span className="text-zinc-400">{player.goals || player.seasonGoals || 0} gols</span>
              <span className={`${avgRating >= 7.5 ? 'text-green-400' : 'text-gold'}`}>
                Média: {avgRating}
              </span>
            </div>
          </div>
          <Badge className={badge === 'lenda' 
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
            : 'bg-gold/20 text-gold border-gold/30'
          }>
            {badge === 'lenda' ? 'Lenda' : 'Ídolo'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const SeasonHistoryCard = ({ season }) => (
  <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-lg text-gold">{season.season}</h3>
        {season.trophies?.length > 0 && (
          <div className="flex gap-1">
            {season.trophies.map((t, i) => (
              <Trophy key={i} className="w-4 h-4 text-gold" />
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-2xl font-heading font-bold text-green-400">{season.stats?.wins || 0}</p>
          <p className="text-xs text-zinc-500">Vitórias</p>
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-zinc-400">{season.stats?.draws || 0}</p>
          <p className="text-xs text-zinc-500">Empates</p>
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-red-400">{season.stats?.losses || 0}</p>
          <p className="text-xs text-zinc-500">Derrotas</p>
        </div>
      </div>
      {season.topScorer && (
        <div className="mt-3 pt-3 border-t border-white/5 text-sm">
          <span className="text-zinc-500">Artilheiro: </span>
          <span className="text-white">{season.topScorer}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export const Museum = () => {
  const { currentSave, addTrophy, endSeasonStay, endSeasonLeave } = useGame();
  const [addTrophyOpen, setAddTrophyOpen] = useState(false);
  const [endSeasonConfirm, setEndSeasonConfirm] = useState(false);
  const [leaveTeamDialog, setLeaveTeamDialog] = useState(false);
  const [newTeamData, setNewTeamData] = useState({ team: { name: '' }, league: null, season: '' });
  const [trophyData, setTrophyData] = useState({ name: '', type: '' });

  const trophies = currentSave?.trophies || [];
  const players = currentSave?.players || [];
  const careerHistory = currentSave?.careerHistory || [];

  // Find hall of fame players
  const hallOfFame = useMemo(() => {
    const hof = [];
    players.forEach(player => {
      const badge = getPlayerBadge(player) || player.badge;
      if (badge) {
        hof.push({ player, badge });
      }
    });
    return hof;
  }, [players]);

  const handleAddTrophy = () => {
    if (!trophyData.name || !trophyData.type) {
      toast.error('Preencha todos os campos');
      return;
    }

    addTrophy({
      name: trophyData.name,
      type: trophyData.type,
      season: currentSave?.season,
    });

    setAddTrophyOpen(false);
    setTrophyData({ name: '', type: '' });
    toast.success('Troféu adicionado! 🏆');
  };

  const handleEndSeason = () => {
    endSeason();
    setEndSeasonConfirm(false);
    toast.success('Temporada encerrada! Nova temporada iniciada.');
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="museum-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
            Museu
          </h1>
          <p className="text-zinc-500">Troféus, lendas e história do clube</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            data-testid="add-trophy-btn"
            onClick={() => setAddTrophyOpen(true)}
            className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
          >
            <Plus size={18} className="mr-2" />
            Troféu
          </Button>
        </div>
      </div>

      {/* Trophy Cabinet */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-gold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Sala de Troféus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trophies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trophies.map(trophy => (
                <TrophyCard key={trophy.id} trophy={trophy} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum troféu conquistado ainda</p>
              <p className="text-zinc-600 text-sm mt-1">Conquiste títulos para exibi-los aqui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hall of Fame */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-6 h-6 text-gold" />
            Hall da Fama
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hallOfFame.length > 0 ? (
            <div className="space-y-4">
              {/* Legends */}
              {hallOfFame.filter(h => h.badge === 'lenda').length > 0 && (
                <div>
                  <h3 className="font-heading text-purple-400 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Lendas
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {hallOfFame.filter(h => h.badge === 'lenda').map(({ player, badge }) => (
                      <HallOfFameCard key={player.id} player={player} badge={badge} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Idols */}
              {hallOfFame.filter(h => h.badge === 'idolo').length > 0 && (
                <div>
                  <h3 className="font-heading text-gold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Ídolos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {hallOfFame.filter(h => h.badge === 'idolo').map(({ player, badge }) => (
                      <HallOfFameCard key={player.id} player={player} badge={badge} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum ídolo ou lenda ainda</p>
              <p className="text-zinc-600 text-sm mt-1">
                Ídolo: 50+ jogos E (Média 7.0+ OU 30+ gols)<br/>
                Lenda: 100+ jogos E Média 7.5+
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season History */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-6 h-6" />
            Histórico de Temporadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonHistory.length > 0 ? (
            <ScrollArea className="max-h-[400px]">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {[...seasonHistory].reverse().map((season, i) => (
                  <SeasonHistoryCard key={i} season={season} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhuma temporada arquivada</p>
              <p className="text-zinc-600 text-sm mt-1">Encerre a temporada para arquivar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* End Season */}
      <Card className="bg-gradient-to-br from-blood/10 to-transparent border-blood/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blood" />
                Encerrar Temporada
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                Arquiva estatísticas, zera notas/gols e inicia nova temporada
              </p>
            </div>
            <Button
              data-testid="end-season-btn"
              onClick={() => setEndSeasonConfirm(true)}
              className="bg-blood hover:bg-blood-dark text-white font-heading font-bold uppercase tracking-widest blood-glow"
            >
              Encerrar Temporada
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Trophy Dialog */}
      <Dialog open={addTrophyOpen} onOpenChange={setAddTrophyOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gold" />
              Novo Troféu
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Nome do Troféu *
              </Label>
              <Input
                data-testid="trophy-name-input"
                value={trophyData.name}
                onChange={(e) => setTrophyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Premier League 2025/26"
                className="bg-black/50 border-white/10 focus:border-gold text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Tipo de Competição *
              </Label>
              <Select
                value={trophyData.type}
                onValueChange={(value) => setTrophyData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger data-testid="trophy-type-select" className="bg-black/50 border-white/10 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {TROPHY_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-gold/10">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setAddTrophyOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              data-testid="save-trophy-btn"
              onClick={handleAddTrophy}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
            >
              <Trophy size={18} className="mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Season Confirmation */}
      <AlertDialog open={endSeasonConfirm} onOpenChange={setEndSeasonConfirm}>
        <AlertDialogContent className="bg-[#1a1a1a] border-blood/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blood" />
              Encerrar Temporada?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Arquivar todas as estatísticas da temporada atual</li>
                <li>Zerar gols, jogos e notas de todos os jogadores</li>
                <li>Manter badges de Ídolo/Lenda conquistados</li>
                <li>Incrementar o ano da temporada</li>
                <li>Limpar o calendário de partidas</li>
              </ul>
              <p className="mt-3 text-orange-400">Esta ação não pode ser desfeita!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              data-testid="confirm-end-season-btn"
              onClick={handleEndSeason}
              className="bg-blood hover:bg-blood-dark text-white"
            >
              Encerrar Temporada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Museum;
