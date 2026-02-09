import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { COMPETITIONS } from '../data/constants';
import { parseCalendarImport, formatDate } from '../utils/helpers';
import { 
  Plus, 
  Calendar as CalendarIcon,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Home,
  Plane
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Switch } from '../components/ui/switch';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { toast } from 'sonner';

const emptyMatch = {
  date: '',
  opponent: '',
  competition: '',
  isHome: true,
};

const MatchCard = ({ match, onDelete }) => {
  const date = match.date ? parseISO(match.date) : null;
  
  return (
    <div className={`
      p-4 rounded border transition-all
      ${match.played 
        ? 'bg-zinc-900/30 border-zinc-800' 
        : 'bg-gradient-to-r from-zinc-900/50 to-transparent border-l-4 border-gold/50 hover:border-gold'
      }
    `}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {match.isHome ? (
            <Home className="w-5 h-5 text-green-400" />
          ) : (
            <Plane className="w-5 h-5 text-blue-400" />
          )}
          <div>
            <p className="font-heading font-semibold text-white">{match.opponent}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                {match.competition}
              </Badge>
              {match.played && (
                <Badge className={
                  match.goalsFor > match.goalsAgainst 
                    ? 'bg-green-500/20 text-green-400' 
                    : match.goalsFor < match.goalsAgainst
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-500/20 text-zinc-400'
                }>
                  {match.goalsFor} - {match.goalsAgainst}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {date && (
            <span className="text-sm text-zinc-500">
              {format(date, 'dd/MM', { locale: ptBR })}
            </span>
          )}
          {!match.played && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(match.id)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const MonthView = ({ matches, currentMonth, onMonthChange }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMatchesForDay = (day) => {
    return matches.filter(m => {
      const matchDate = m.date ? parseISO(m.date) : null;
      return matchDate && isSameDay(matchDate, day);
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Pad days to start on correct day of week
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(-1)}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <CardTitle className="font-heading text-xl text-gold uppercase tracking-wider">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(1)}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-heading text-zinc-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddedDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            
            const dayMatches = getMatchesForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square p-1 rounded transition-all
                  ${isToday ? 'bg-gold/20 ring-1 ring-gold' : 'hover:bg-zinc-800/50'}
                `}
              >
                <div className="text-center">
                  <span className={`text-xs ${isToday ? 'text-gold font-bold' : 'text-zinc-400'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                {dayMatches.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {dayMatches.slice(0, 2).map(match => (
                      <div
                        key={match.id}
                        className={`
                          text-[10px] truncate px-1 rounded
                          ${match.played 
                            ? match.goalsFor > match.goalsAgainst 
                              ? 'bg-green-500/30 text-green-300'
                              : match.goalsFor < match.goalsAgainst
                                ? 'bg-red-500/30 text-red-300'
                                : 'bg-zinc-500/30 text-zinc-300'
                            : 'bg-gold/20 text-gold'
                          }
                        `}
                        title={match.opponent}
                      >
                        {match.opponent.slice(0, 6)}
                      </div>
                    ))}
                    {dayMatches.length > 2 && (
                      <span className="text-[10px] text-zinc-500">+{dayMatches.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendarPage = () => {
  const { currentSave, addMatch, addMatches, deleteMatch } = useGame();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(emptyMatch);
  const [importText, setImportText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const matches = currentSave?.matches || [];
  const upcomingMatches = matches
    .filter(m => !m.played)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleMonthChange = (delta) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const handleAddMatch = () => {
    if (!formData.opponent || !formData.competition || !selectedDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addMatch({
      ...formData,
      date: selectedDate.toISOString().split('T')[0],
    });
    
    setAddDialogOpen(false);
    setFormData(emptyMatch);
    setSelectedDate(null);
    toast.success('Partida adicionada!');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Cole os dados das partidas');
      return;
    }

    // Get current year from season
    const [startYear] = currentSave?.season?.split('/') || ['2025'];
    const year = parseInt(startYear);

    const imported = parseCalendarImport(importText, year);
    
    if (imported.length === 0) {
      toast.error('Formato inválido. Use: DD/MM;Adversário;Competição;C ou F');
      return;
    }

    addMatches(imported);
    setImportDialogOpen(false);
    setImportText('');
    toast.success(`${imported.length} partidas importadas!`);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMatch(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Partida removida');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">
            Calendário
          </h1>
          <p className="text-zinc-500">{upcomingMatches.length} partidas agendadas</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            data-testid="import-calendar-btn"
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="border-gold/30 text-gold hover:bg-gold/10 font-heading uppercase tracking-widest"
          >
            <Upload size={18} className="mr-2" />
            Importar
          </Button>
          <Button
            data-testid="add-match-btn"
            onClick={() => setAddDialogOpen(true)}
            className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
          >
            <Plus size={18} className="mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <MonthView 
            matches={matches} 
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Upcoming Matches List */}
        <div>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider">
                Próximas Partidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        onDelete={setDeleteConfirm}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500">Nenhuma partida agendada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Match Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-white uppercase tracking-wider">
              Nova Partida
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Data *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    data-testid="match-date-trigger"
                    variant="outline"
                    className="w-full justify-start bg-black/50 border-white/10 text-white hover:bg-black/70"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ptBR}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Adversário *
              </Label>
              <Input
                data-testid="match-opponent-input"
                value={formData.opponent}
                onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
                placeholder="Nome do adversário"
                className="bg-black/50 border-white/10 focus:border-gold text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Competição *
              </Label>
              <Select
                value={formData.competition}
                onValueChange={(value) => setFormData(prev => ({ ...prev, competition: value }))}
              >
                <SelectTrigger data-testid="match-competition-select" className="bg-black/50 border-white/10 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {COMPETITIONS.map(comp => (
                    <SelectItem key={comp} value={comp} className="text-white hover:bg-gold/10">
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded">
              <div className="flex items-center gap-3">
                {formData.isHome ? (
                  <Home className="w-5 h-5 text-green-400" />
                ) : (
                  <Plane className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-white">{formData.isHome ? 'Jogo em Casa' : 'Jogo Fora'}</span>
              </div>
              <Switch
                data-testid="match-home-switch"
                checked={formData.isHome}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHome: checked }))}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              data-testid="save-match-btn"
              onClick={handleAddMatch}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-white uppercase tracking-wider">
              Importar Calendário
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Cole os dados das partidas no formato especificado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-zinc-900/50 rounded text-sm">
              <p className="text-gold font-heading mb-2">Formato:</p>
              <code className="text-zinc-400">DD/MM;Adversário;Competição;C ou F</code>
              <p className="text-zinc-500 mt-2 text-xs">
                C = Casa, F = Fora. Uma partida por linha.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                Dados das Partidas
              </Label>
              <Textarea
                data-testid="import-textarea"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`15/08;Manchester City;Liga;C
22/08;Liverpool;Liga;F
29/08;Arsenal;Liga;C`}
                rows={8}
                className="bg-black/50 border-white/10 focus:border-gold text-white font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              data-testid="process-import-btn"
              onClick={handleImport}
              className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
            >
              <Upload size={18} className="mr-2" />
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-white">Remover Partida?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação não pode ser desfeita.
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

export default CalendarPage;
