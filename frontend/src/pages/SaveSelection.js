import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LEAGUES, TEAMS_BY_LEAGUE } from '../data/constants';
import { importSaveFromJSON } from '../utils/helpers';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Play, 
  Download,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { ImageFallback, TeamLogo } from '../components/ImageFallback';
import { formatDate } from '../utils/helpers';
import { toast } from 'sonner';

// Wizard Steps
const WIZARD_STEPS = [
  { id: 1, title: 'Técnico', description: 'Informações do técnico' },
  { id: 2, title: 'Liga', description: 'Escolha a liga' },
  { id: 3, title: 'Clube', description: 'Selecione o time' },
  { id: 4, title: 'Temporada', description: 'Defina o ano' },
];

const SaveCard = ({ save, onLoad, onExport, onDelete }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Card className="group card-highlight bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 hover:border-gold/30 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
            {!logoError && save.team?.logo ? (
              <img 
                src={save.team.logo} 
                alt={save.team.name}
                className="w-12 h-12 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Shield className="w-8 h-8 text-zinc-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-xl text-white truncate">
              {save.team?.name || 'Time'}
            </h3>
            <p className="text-sm text-zinc-500">{save.league?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gold font-heading tracking-wider">
                {save.season}
              </span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">
                {save.coach?.name}
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              Atualizado: {formatDate(save.updatedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
          <Button
            data-testid={`load-save-${save.id}`}
            onClick={() => onLoad(save.id)}
            className="flex-1 bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest"
          >
            <Play size={16} className="mr-2" />
            Carregar
          </Button>
          <Button
            data-testid={`export-save-${save.id}`}
            variant="outline"
            size="icon"
            onClick={() => onExport(save)}
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Download size={16} />
          </Button>
          <Button
            data-testid={`delete-save-${save.id}`}
            variant="outline"
            size="icon"
            onClick={() => onDelete(save.id)}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const WizardProgress = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div 
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm
              ${currentStep > step.id 
                ? 'bg-gold text-black' 
                : currentStep === step.id 
                  ? 'bg-gold/20 border-2 border-gold text-gold' 
                  : 'bg-zinc-800 text-zinc-500'
              }
            `}
          >
            {currentStep > step.id ? <Check size={18} /> : step.id}
          </div>
          <span className={`
            text-xs mt-2 font-heading uppercase tracking-wider hidden sm:block
            ${currentStep >= step.id ? 'text-gold' : 'text-zinc-600'}
          `}>
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-12 h-0.5 ${currentStep > step.id ? 'bg-gold' : 'bg-zinc-700'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export const SaveSelection = () => {
  const { saves, loadSave, deleteSave, importSave, createSave } = useGame();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    coach: { name: '', photo: '' },
    league: null,
    team: { name: '', logo: '' },
    season: '2025/26',
  });
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const saveData = await importSaveFromJSON(file);
      importSave(saveData);
      toast.success('Save importado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao importar save');
    }
    
    e.target.value = '';
  };

  const handleExport = (save) => {
    const { exportSaveAsJSON } = require('../utils/helpers');
    exportSaveAsJSON(save);
    toast.success('Save exportado!');
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteSave(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Save deletado');
    }
  };

  const handleWizardNext = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      // Create save
      createSave(wizardData);
      setWizardOpen(false);
      setWizardStep(1);
      setWizardData({
        coach: { name: '', photo: '' },
        league: null,
        team: { name: '', logo: '' },
        season: '2025/26',
      });
      toast.success('Save criado com sucesso!');
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const canProceed = () => {
    switch (wizardStep) {
      case 1: return wizardData.coach.name.trim() !== '';
      case 2: return wizardData.league !== null;
      case 3: return wizardData.team.name.trim() !== '';
      case 4: return wizardData.season.trim() !== '';
      default: return false;
    }
  };

  const handleLeagueSelect = (league) => {
    setWizardData(prev => ({
      ...prev,
      league,
      team: { name: '', logo: '' }, // Reset team when league changes
    }));
  };

  const teamsForLeague = wizardData.league?.name 
    ? TEAMS_BY_LEAGUE[wizardData.league.name] || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-white tracking-tighter uppercase mb-2">
            Gestor de <span className="text-gold">MC</span>
          </h1>
          <p className="font-accent italic text-lg text-zinc-400">
            "Seu modo carreira, sua história."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button
            data-testid="new-save-btn"
            onClick={() => setWizardOpen(true)}
            className="flex-1 h-16 bg-gold hover:bg-gold-dim text-black font-heading font-bold text-lg uppercase tracking-widest gold-glow-hover"
          >
            <Plus size={24} className="mr-3" />
            Novo Save
          </Button>
          
          <Button
            data-testid="import-save-btn"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 h-16 border-gold/30 text-gold hover:bg-gold/10 font-heading font-bold text-lg uppercase tracking-widest"
          >
            <Upload size={24} className="mr-3" />
            Importar Save
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Saves List */}
        {saves.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-heading font-semibold text-xl text-zinc-300 uppercase tracking-wider">
              Seus Saves
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {saves.map(save => (
                <SaveCard
                  key={save.id}
                  save={save}
                  onLoad={loadSave}
                  onExport={handleExport}
                  onDelete={setDeleteConfirm}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-dashed border-zinc-700">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-body">
                Nenhum save encontrado. Crie um novo ou importe um existente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading text-white">Excluir Save?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Esta ação não pode ser desfeita. O save será permanentemente removido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-blood hover:bg-blood-dark text-white"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Creation Wizard Dialog */}
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-2xl text-white uppercase tracking-wider">
                Novo Save
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Configure seu modo carreira em 4 passos
              </DialogDescription>
            </DialogHeader>

            <WizardProgress currentStep={wizardStep} steps={WIZARD_STEPS} />

            <ScrollArea className="max-h-[50vh] pr-4">
              {/* Step 1: Coach */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {wizardData.coach.photo ? (
                        <img 
                          src={wizardData.coach.photo} 
                          alt="Técnico"
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <User className="w-12 h-12 text-zinc-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Nome do Técnico *
                    </Label>
                    <Input
                      data-testid="coach-name-input"
                      value={wizardData.coach.name}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        coach: { ...prev.coach, name: e.target.value }
                      }))}
                      placeholder="Ex: José Mourinho"
                      className="bg-black/50 border-white/10 focus:border-gold text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      URL da Foto (opcional)
                    </Label>
                    <Input
                      data-testid="coach-photo-input"
                      value={wizardData.coach.photo}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        coach: { ...prev.coach, photo: e.target.value }
                      }))}
                      placeholder="https://..."
                      className="bg-black/50 border-white/10 focus:border-gold text-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: League */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm text-zinc-400 mb-4">Selecione a liga do seu modo carreira:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LEAGUES.map((league) => (
                      <button
                        key={league.name}
                        data-testid={`league-${league.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => handleLeagueSelect(league)}
                        className={`
                          p-4 rounded-sm border transition-all duration-200 flex flex-col items-center gap-2
                          ${wizardData.league?.name === league.name
                            ? 'border-gold bg-gold/10'
                            : 'border-white/10 bg-zinc-900/50 hover:border-gold/50'
                          }
                        `}
                      >
                        <TeamLogo src={league.logo} name={league.name} size="md" />
                        <span className="text-xs text-center text-zinc-300 font-heading">
                          {league.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Club */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 p-3 bg-gold/10 rounded border border-gold/30">
                    <TeamLogo src={wizardData.league?.logo} name={wizardData.league?.name} size="sm" />
                    <span className="font-heading text-gold">{wizardData.league?.name}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Selecione ou Digite o Nome do Clube *
                    </Label>
                    <Select
                      value={wizardData.team.name}
                      onValueChange={(value) => setWizardData(prev => ({
                        ...prev,
                        team: { ...prev.team, name: value }
                      }))}
                    >
                      <SelectTrigger 
                        data-testid="team-select"
                        className="bg-black/50 border-white/10 text-white"
                      >
                        <SelectValue placeholder="Escolha um time..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {teamsForLeague.map(team => (
                          <SelectItem key={team} value={team} className="text-white hover:bg-gold/10">
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center text-zinc-500 text-sm">ou</div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Nome Personalizado
                    </Label>
                    <Input
                      data-testid="team-name-input"
                      value={wizardData.team.name}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        team: { ...prev.team, name: e.target.value }
                      }))}
                      placeholder="Ex: FC Custom"
                      className="bg-black/50 border-white/10 focus:border-gold text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      URL do Escudo (opcional)
                    </Label>
                    <Input
                      data-testid="team-logo-input"
                      value={wizardData.team.logo}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        team: { ...prev.team, logo: e.target.value }
                      }))}
                      placeholder="https://..."
                      className="bg-black/50 border-white/10 focus:border-gold text-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Season */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded border border-white/5">
                    <div className="w-16 h-16 rounded bg-zinc-800 flex items-center justify-center">
                      {wizardData.team.logo ? (
                        <img 
                          src={wizardData.team.logo} 
                          alt={wizardData.team.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <Shield className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-white">{wizardData.team.name}</h3>
                      <p className="text-sm text-zinc-500">{wizardData.league?.name}</p>
                      <p className="text-xs text-zinc-600">Técnico: {wizardData.coach.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase tracking-wider text-xs text-zinc-500">
                      Temporada Inicial *
                    </Label>
                    <Input
                      data-testid="season-input"
                      value={wizardData.season}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        season: e.target.value
                      }))}
                      placeholder="Ex: 2025/26"
                      className="bg-black/50 border-white/10 focus:border-gold text-white text-center text-2xl font-heading"
                    />
                    <p className="text-xs text-zinc-600 text-center">
                      Formato: AAAA/AA (ex: 2025/26)
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="flex-row gap-3 pt-4 border-t border-white/5">
              {wizardStep > 1 && (
                <Button
                  data-testid="wizard-back-btn"
                  variant="outline"
                  onClick={handleWizardBack}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Voltar
                </Button>
              )}
              <Button
                data-testid="wizard-next-btn"
                onClick={handleWizardNext}
                disabled={!canProceed()}
                className="flex-1 bg-gold hover:bg-gold-dim text-black font-heading font-bold uppercase tracking-widest disabled:opacity-50"
              >
                {wizardStep === 4 ? 'Criar Save' : 'Próximo'}
                {wizardStep < 4 && <ChevronRight size={18} className="ml-1" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SaveSelection;
