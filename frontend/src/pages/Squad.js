import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { POSITIONS } from '../data/constants';
import { getPlayerStatus, getPlayerBadge } from '../utils/helpers';
import { 
  Plus, 
  List, 
  LayoutGrid,
  User,
  Flame,
  Snowflake,
  Star,
  Crown,
  Shield,
  Trash2,
  Edit,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PlayerAvatar } from '../components/ImageFallback';
import { toast } from 'sonner';

const emptyPlayer = {
  name: '',
  position: '',
  age: '',
  overall: '',
  potential: '',
  value: '',
  photo: '',
};

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'fire':
      return <Flame className="w-4 h-4 text-orange-500" />;
    case 'ice':
      return <Snowflake className="w-4 h-4 text-blue-400" />;
    default:
      return null;
  }
};

const BadgeIcon = ({ badge }) => {
  switch (badge) {
    case 'lenda':
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
          <Crown className="w-3 h-3 mr-1" /> Lenda
        </Badge>
      );
    case 'idolo':
      return (
        <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
          <Star className="w-3 h-3 mr-1" /> Ídolo
        </Badge>
      );
    default:
      return null;
  }
};

const HierarchyBadge = ({ isCaptain, isViceCaptain }) => {
  if (isCaptain) {
    return (
      <Badge className="bg-gold/20 text-gold border-gold/30 text-xs font-bold">
        C
      </Badge>
    );
  }
  if (isViceCaptain) {
    return (
      <Badge className="bg-zinc-500/20 text-zinc-300 border-zinc-500/30 text-xs font-bold">
        VC
      </Badge>
    );
  }
  return null;
};

const PlayerRow = ({ player, onEdit, onDelete, onSetCaptain, onSetViceCaptain }) => {
  const status = getPlayerStatus(player);
  const badge = getPlayerBadge(player);
  const avgRating = player.ratings?.length > 0 
    ? (player.ratings.reduce((a, b) => a + b, 0) / player.ratings.length).toFixed(1)
    : '-';

  return (
    <TableRow className="hover:bg-white/5 border-white/5">
      <TableCell>
        <div className="flex items-center gap-3">
          <PlayerAvatar src={player.photo} name={player.name} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-white">{player.name}</span>
              <HierarchyBadge isCaptain={player.isCaptain} isViceCaptain={player.isViceCaptain} />
              <StatusIcon status={status} />
            </div>
            <BadgeIcon badge={badge} />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="border-gold/30 text-gold font-heading">
          {player.position}
        </Badge>
      </TableCell>
      <TableCell className="text-zinc-400">{player.age}</TableCell>
      <TableCell>
        <span className={`font-heading font-bold ${player.overall >= 80 ? 'text-green-400' : player.overall >= 70 ? 'text-gold' : 'text-zinc-400'}`}>
          {player.overall}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-zinc-500">{player.potential}</span>
      </TableCell>
      <TableCell className="text-zinc-400">{player.games || 0}</TableCell>
      <TableCell className="text-zinc-400">{player.goals || 0}</TableCell>
      <TableCell className="text-zinc-400">{player.assists || 0}</TableCell>
      <TableCell>
        <span className={`font-heading font-bold ${avgRating >= 7.5 ? 'text-green-400' : avgRating >= 6 ? 'text-gold' : avgRating !== '-' ? 'text-red-400' : 'text-zinc-600'}`}>
          {avgRating}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
            <DropdownMenuItem onClick={() => onEdit(player)} className="text-white hover:bg-gold/10">
              <Edit className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            {!player.isCaptain && (
              <DropdownMenuItem onClick={() => onSetCaptain(player.id)} className="text-gold hover:bg-gold/10">
                <Crown className="w-4 h-4 mr-2" /> Definir Capitão
              </DropdownMenuItem>
            )}
            {!player.isViceCaptain && !player.isCaptain && (
              <DropdownMenuItem onClick={() => onSetViceCaptain(player.id)} className="text-zinc-300 hover:bg-gold/10">
                <Shield className="w-4 h-4 mr-2" /> Definir Vice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(player.id)} className="text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const FieldView = ({ players }) => {
  const positionMap = {
    'GOL': { top: '85%', left: '50%' },
    'ZAG': [{ top: '70%', left: '35%' }, { top: '70%', left: '65%' }],
    'LE': { top: '55%', left: '10%' },
    'LD': { top: '55%', left: '90%' },
    'VOL': [{ top: '50%', left: '35%' }, { top: '50%', left: '65%' }],
    'MC': { top: '40%', left: '50%' },
    'MEI': { top: '30%', left: '50%' },
    'PE': { top: '20%', left: '20%' },
    'PD': { top: '20%', left: '80%' },
    'SA': { top: '15%', left: '50%' },
    'CA': { top: '8%', left: '50%' },
  };

  const getPositionStyle = (pos, index) => {
    const positions = positionMap[pos];
    if (Array.isArray(positions)) {
      return positions[index % positions.length];
    }
    return positions || { top: '50%', left: '50%' };
  };

  const playersByPosition = {};
  players.forEach(p => {
    if (!playersByPosition[p.position]) {
      playersByPosition[p.position] = [];
    }
    playersByPosition[p.position].push(p);
  });

  return (
    <div className="relative w-full aspect-[2/3] max-w-2xl mx-auto bg-gradient-to-b from-green-900 to-green-800 rounded-lg overflow-hidden border-4 border-white/20">
      {/* Field markings */}
      <div className="absolute inset-4 border-2 border-white/30 rounded" />
      <div className="absolute top-1/2 left-4 right-4 border-t-2 border-white/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-white/30" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-white/30" />

      {/* Players */}
      {Object.entries(playersByPosition).map(([pos, posPlayers]) => 
        posPlayers.slice(0, 2).map((player, i) => {
          const style = getPositionStyle(pos, i);
          const status = getPlayerStatus(player);
          
          return (
            <div
              key={player.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ top: style.top, left: style.left }}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                ${status === 'fire' ? 'bg-orange-500 text-white ring-2 ring-orange-300' :
                  status === 'ice' ? 'bg-blue-500 text-white ring-2 ring-blue-300' :
                  'bg-white text-black'}
              `}>
                {player.overall}
              </div>
              <span className="text-xs text-white font-heading mt-1 bg-black/50 px-1 rounded whitespace-nowrap">
                {player.name.split(' ')[0]}
              </span>
              {player.isCaptain && (
                <Badge className="mt-1 bg-gold text-black text-[10px] px-1 py-0">C</Badge>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export const Squad = () => {
  const { currentSave, addPlayer, updatePlayer, deletePlayer, setCaptain, setViceCaptain } = useGame();
  const [view, setView] = useState('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState(emptyPlayer);
  const [positionFilter, setPositionFilter] = useState('all');

  const players = currentSave?.players || [];

  const filteredPlayers = useMemo(() => {
    if (positionFilter === 'all') return players;
    const category = POSITIONS.find(p => p.code === positionFilter)?.category;
    if (category) {
      return players.filter(p => 
        POSITIONS.find(pos => pos.code === p.position)?.category === category
      );
    }
    return players.filter(p => p.position === positionFilter);
  }, [players, positionFilter]);

  const handleOpenDialog = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        position: player.position,
        age: player.age?.toString() || '',
        overall: player.overall?.toString() || '',
        potential: player.potential?.toString() || '',
        value: player.value || '',
        photo: player.photo || '',
      });
    } else {
      setEditingPlayer(null);
      setFormData(emptyPlayer);
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const playerData = {
      name: formData.name,
      position: formData.position,
      age: parseInt(formData.age) || 0,
      overall: parseInt(formData.overall) || 0,
      potential: parseInt(formData.potential) || 0,
      value: formData.value,
      photo: formData.photo,
    };

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, playerData);
      toast.success('Jogador atualizado!');
    } else {
      addPlayer(playerData);
      toast.success('Jogador adicionado!');
    }

    setDialogOpen(false);
    setFormData(emptyPlayer);
    setEditingPlayer(null);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deletePlayer(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Jogador removido');
    }
  };

  const handleSetCaptain = (playerId) => {
    setCaptain(playerId);
    toast.success('Capitão definido!');
  };

  const handleSetViceCaptain = (playerId) => {
    setViceCaptain(playerId);
    toast.success('Vice-capitão definido!');
  };

  const isFormValid = formData.name && formData.position && formData.overall;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="squad-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
            Elenco
          </h1>
          <p className="text-zinc-500">{players.length} jogadores</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="list" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <List size={18} />
              </TabsTrigger>
              <TabsTrigger value="field" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <LayoutGrid size={18} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            data-testid="add-player-btn"
            onClick={() => handleOpenDialog()}
            className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
          >
            <Plus size={18} className="mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Position Filter */}
      {view === 'list' && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={positionFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPositionFilter('all')}
            className={positionFilter === 'all' ? 'bg-gold text-black' : 'border-zinc-700 text-zinc-400'}
          >
            Todos
          </Button>
          {['Goleiro', 'Defesa', 'Meio-campo', 'Ataque'].map(cat => (
            <Button
              key={cat}
              variant={positionFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPositionFilter(cat)}
              className={positionFilter === cat ? 'bg-gold text-black' : 'border-zinc-700 text-zinc-400'}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {view === 'list' ? (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Jogador</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Pos</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Idade</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">OVR</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">POT</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Jogos</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Gols</TableHead>
                  <TableHead className="font-heading uppercase tracking-wider text-zinc-500">Média</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map(player => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      onEdit={handleOpenDialog}
                      onDelete={setDeleteConfirm}
                      onSetCaptain={handleSetCaptain}
                      onSetViceCaptain={handleSetViceCaptain}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500">Nenhum jogador cadastrado</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5 p-6">
          {players.length > 0 ? (
            <FieldView players={players} />
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Adicione jogadores para visualizar no campo</p>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-white uppercase tracking-wider">
              {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <PlayerAvatar src={formData.photo} name={formData.name} size="lg" />
              <div className="flex-1 space-y-2">
                <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                  Nome *
                </Label>
                <Input
                  data-testid="player-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do jogador"
                  className="bg-black/50 border-white/10 focus:border-gold text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                  Posição *
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger data-testid="player-position-select" className="bg-black/50 border-white/10 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {POSITIONS.map(pos => (
                      <SelectItem key={pos.code} value={pos.code} className="text-white hover:bg-gold/10">
                        {pos.code} - {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                  Idade
                </Label>
                <Input
                  data-testid="player-age-input"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="25"
                  className="bg-black/50 border-white/10 focus:border-gold text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                  Overall *
                </Label>
                <Input
                  data-testid="player-overall-input"
                  type="number"
                  value={formData.overall}
                  onChange={(e) => setFormData(prev => ({ ...prev, overall: e.target.value }))}
                  placeholder="75"
                  className="bg-black/50 border-white/10 focus:border-gold text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                  Potencial
                </Label>
                <Input
                  data-testid="player-potential-input"
                  type="number"
                  value={formData.potential}
                  onChange={(e) => setFormData(prev => ({ ...prev, potential: e.target.value }))}
                  placeholder="85"
                  className="bg-black/50 border-white/10 focus:border-gold text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Valor de Mercado
              </Label>
              <Input
                data-testid="player-value-input"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="€5M"
                className="bg-black/50 border-white/10 focus:border-gold text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                URL da Foto
              </Label>
              <Input
                data-testid="player-photo-input"
                value={formData.photo}
                onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                placeholder="https://..."
                className="bg-black/50 border-white/10 focus:border-gold text-white"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              data-testid="save-player-btn"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {editingPlayer ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-white">Remover Jogador?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação não pode ser desfeita. O jogador será removido permanentemente do elenco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-blood hover:bg-blood-dark text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Squad;
