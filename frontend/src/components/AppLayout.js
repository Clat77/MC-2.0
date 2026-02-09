import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  Trophy, 
  Briefcase,
  Swords,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'squad', label: 'Elenco', icon: Users },
  { id: 'matches', label: 'Partidas', icon: Swords },
  { id: 'calendar', label: 'Calendário', icon: Calendar },
  { id: 'office', label: 'Escritório', icon: Briefcase },
  { id: 'museum', label: 'Museu', icon: Trophy },
];

const NavItem = ({ item, active, onClick, mobile }) => {
  const Icon = item.icon;
  
  return (
    <button
      data-testid={`nav-${item.id}`}
      onClick={() => onClick(item.id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
        font-heading uppercase tracking-wider text-sm
        ${active 
          ? 'text-gold bg-gold/5 border-r-2 border-gold' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
        }
        ${mobile ? 'text-base' : ''}
      `}
    >
      <Icon size={20} className={active ? 'text-gold' : ''} />
      <span>{item.label}</span>
    </button>
  );
};

const TeamHeader = ({ team, coach, season, onLogoError }) => (
  <div className="p-6 border-b border-white/5">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded bg-zinc-800/50 flex items-center justify-center overflow-hidden">
        {team?.logo ? (
          <img 
            src={team.logo} 
            alt={team.name}
            className="w-10 h-10 object-contain"
            onError={onLogoError}
          />
        ) : (
          <Shield className="w-8 h-8 text-zinc-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-heading font-bold text-lg text-white truncate">
          {team?.name || 'Meu Time'}
        </h2>
        <p className="text-xs text-zinc-500 truncate">{coach?.name || 'Técnico'}</p>
        <p className="text-xs text-gold font-heading tracking-wider">{season}</p>
      </div>
    </div>
  </div>
);

export const AppLayout = ({ children, activePage, onPageChange }) => {
  const { currentSave, exitSave } = useGame();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setMobileOpen(false);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <TeamHeader 
        team={logoError ? null : currentSave?.team}
        coach={currentSave?.coach}
        season={currentSave?.season}
        onLogoError={handleLogoError}
      />
      
      <ScrollArea className="flex-1">
        <nav className="py-4">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={activePage === item.id}
              onClick={handleNavClick}
              mobile={mobile}
            />
          ))}
        </nav>
      </ScrollArea>
      
      <Separator className="bg-white/5" />
      
      <div className="p-4">
        <Button
          data-testid="exit-save-btn"
          variant="ghost"
          onClick={exitSave}
          className="w-full justify-start gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 font-heading uppercase tracking-wider text-sm"
        >
          <LogOut size={18} />
          Sair do Save
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#0a0a0a]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="mobile-menu-btn"
                className="text-zinc-400 hover:text-white"
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-white/5">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-3">
            {!logoError && currentSave?.team?.logo ? (
              <img 
                src={currentSave.team.logo} 
                alt=""
                className="w-8 h-8 object-contain"
                onError={handleLogoError}
              />
            ) : (
              <Shield className="w-6 h-6 text-zinc-600" />
            )}
            <span className="font-heading font-bold text-white">
              {currentSave?.team?.name || 'Gestor MC'}
            </span>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:block lg:w-64 lg:h-screen lg:border-r lg:border-white/5">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
