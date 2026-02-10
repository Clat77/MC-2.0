import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { COMPETITIONS } from '../data/constants';
import { parseCalendarImport, formatDate } from '../utils/helpers';
import { Plus, Calendar as CalendarIcon, Upload, Trash2, Home, Plane } from 'lucide-react';
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
import { Switch } from '../components/ui/switch';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const MatchCard = ({ match, onDelete }) => {
  const date = match.date ? parseISO(match.date) : null;
  return (
    <div className={`p-4 rounded border transition-all ${match.played ? 'bg-zinc-900/30 border-zinc-800' : 'bg-gradient-to-r from-zinc-900/50 to-transparent border-l-4 border-gold/50 hover:border-gold'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {match.isHome ? <Home className="w-5 h-5 text-green-400" /> : <Plane className="w-5 h-5 text-blue-400" />}
          <div>
            <p className="font-heading font-semibold text-white">{match.opponent}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">{match.competition}</Badge>
              {match.played && (
                <Badge className={match.goalsFor > match.goalsAgainst ? 'bg-green-500/20 text-green-400' : match.goalsFor < match.goalsAgainst ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'}>
                  {match.goalsFor} - {match.goalsAgainst}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {date && <span className="text-sm text-zinc-500">{format(date, 'dd/MM', { locale: ptBR })}</span>}
          {!match.played && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(match.id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CalendarPage = () => {
  const { currentSave, addMatch, addMatches, deleteMatch } = useGame();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ date: '', opponent: '', competition: '', isHome: true });
  const [importText, setImportText] = useState('');

  const matches = currentSave?.matches || [];
  const upcomingMatches = matches.filter(m => !m.played);
  const playedMatches = matches.filter(m => m.played);

  const handleAddMatch = () => {
    if (!formData.opponent || !formData.competition || !formData.date) {
      toast.error('Preencha todos os campos');
      return;
    }
    addMatch({ ...formData });
    setAddDialogOpen(false);
    setFormData({ date: '', opponent: '', competition: '', isHome: true });
    toast.success('Partida adicionada!');
  };

  const handleImport = () => {
    if (!importText.trim()) { toast.error('Cole os dados'); return; }
    const [startYear] = currentSave?.season?.split('/') || ['2025'];
    const imported = parseCalendarImport(importText, parseInt(startYear));
    if (imported.length === 0) { toast.error('Formato inválido'); return; }
    addMatches(imported);
    setImportDialogOpen(false);
    setImportText('');
    toast.success(`${imported.length} partidas importadas!`);
  };

  const handleDelete = () => {
    if (deleteConfirm) { deleteMatch(deleteConfirm); setDeleteConfirm(null); toast.success('Removida'); }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="calendar-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white uppercase tracking-tight">Calendário</h1>
          <p className="text-zinc-500">{upcomingMatches.length} agendadas • {playedMatches.length} jogadas</p>
        </div>
        <div className="flex gap-3">
          <Button data-testid="import-calendar-btn" variant="outline" onClick={() => setImportDialogOpen(true)} className="border-gold/30 text-gold hover:bg-gold/10 font-heading uppercase">
            <Upload size={18} className="mr-2" />Importar
          </Button>
          <Button data-testid="add-match-btn" onClick={() => setAddDialogOpen(true)} className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase">
            <Plus size={18} className="mr-2" />Adicionar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader><CardTitle className="font-heading text-lg text-gold uppercase tracking-wider">Próximas Partidas</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {upcomingMatches.length > 0 ? upcomingMatches.map(m => <MatchCard key={m.id} match={m} onDelete={setDeleteConfirm} />) : (
                  <div className="text-center py-8"><CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500">Nenhuma partida</p></div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-white/5">
          <CardHeader><CardTitle className="font-heading text-lg text-zinc-300 uppercase tracking-wider">Partidas Jogadas</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {playedMatches.length > 0 ? [...playedMatches].reverse().map(m => <MatchCard key={m.id} match={m} onDelete={setDeleteConfirm} />) : (
                  <div className="text-center py-8"><CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500">Nenhuma disputada</p></div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md">
          <DialogHeader><DialogTitle className="font-heading text-white uppercase">Nova Partida</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs text-zinc-500 uppercase">Data (DD/MM/AAAA)</Label>
              <Input data-testid="match-date-input" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} placeholder="15/08/2025" className="bg-black/50 border-white/10 text-white" />
            </div>
            <div><Label className="text-xs text-zinc-500 uppercase">Adversário</Label>
              <Input data-testid="match-opponent-input" value={formData.opponent} onChange={(e) => setFormData(p => ({ ...p, opponent: e.target.value }))} placeholder="Nome" className="bg-black/50 border-white/10 text-white" />
            </div>
            <div><Label className="text-xs text-zinc-500 uppercase">Competição</Label>
              <Select value={formData.competition} onValueChange={(v) => setFormData(p => ({ ...p, competition: v }))}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">{COMPETITIONS.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded">
              <span className="text-white">{formData.isHome ? 'Casa' : 'Fora'}</span>
              <Switch checked={formData.isHome} onCheckedChange={(c) => setFormData(p => ({ ...p, isHome: c }))} />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
            <Button data-testid="save-match-btn" onClick={handleAddMatch} className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-white uppercase">Importar Calendário</DialogTitle>
            <DialogDescription className="text-zinc-500">Formato: DD/MM;Adversário;Competição;C ou F</DialogDescription>
          </DialogHeader>
          <Textarea data-testid="import-textarea" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="15/08;City;Liga;C" rows={8} className="bg-black/50 border-white/10 text-white font-mono text-sm" />
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
            <Button data-testid="process-import-btn" onClick={handleImport} className="bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase">Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader><AlertDialogTitle className="text-white">Remover?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-blood text-white">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarPage;
