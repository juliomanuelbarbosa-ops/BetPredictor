import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Calendar, Brain, Activity, Settings, Crosshair, Zap, Layers, BarChart2, Users, Search, Cpu, Globe2 } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { upcomingMatches, setMatchInput } = useMatchStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm text-stratos-muted glass-panel border border-stratos-border/50 rounded-xl hover:bg-stratos-accent/5 hover:text-white hover:border-stratos-accent/30 transition-all duration-300 w-full group shadow-inner"
      >
        <Search className="w-4 h-4 group-hover:text-stratos-accent transition-colors" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold opacity-80 group-hover:opacity-100 transition-opacity">Search Matrix...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white/5 px-2 font-mono text-[10px] font-medium text-stratos-muted group-hover:text-stratos-accent transition-colors border border-white/5 group-hover:border-stratos-accent/30">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." className="font-mono text-sm tracking-wider uppercase text-white placeholder:text-stratos-muted/50 border-b border-stratos-border focus:ring-0 focus:border-stratos-accent glass-panel" />
        <CommandList className="glass-panel backdrop-blur-xl text-stratos-muted scrollbar-thin scrollbar-thumb-stratos-border scrollbar-track-transparent">
          <CommandEmpty className="text-stratos-muted font-mono uppercase tracking-widest text-[10px] py-6">No results found.</CommandEmpty>
          <CommandGroup heading="Navigation" className="text-stratos-muted font-mono uppercase tracking-[0.2em] text-[10px]">
            <CommandItem onSelect={() => runCommand(() => navigate('/oracle'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Crosshair className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>The Oracle</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/upcoming'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Calendar className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Upcoming Matches</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/accumulator'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Layers className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Matrix Builder</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/calculators'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Crosshair className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Calculators</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/trends'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Activity className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform text-red-500" />
              <span className="text-red-400">Market Trends</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/agent'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-sky-500/10 hover:text-sky-400 aria-selected:bg-sky-500/10 aria-selected:text-sky-400 cursor-pointer group">
              <Cpu className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Local Agent</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/worldcup'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-yellow-500/10 hover:text-yellow-400 aria-selected:bg-yellow-500/10 aria-selected:text-yellow-400 cursor-pointer group">
              <Globe2 className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform text-yellow-400" />
              <span>World Cup 2026</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="bg-stratos-border/50" />
          <CommandGroup heading="Quick Actions" className="text-stratos-muted font-mono uppercase tracking-[0.2em] text-[10px]">
            <CommandItem onSelect={() => runCommand(() => {
                setMatchInput("Arsenal vs Liverpool");
                navigate('/oracle');
            })} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Zap className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Analyze Arsenal vs Liverpool</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/settings'))} className="font-mono uppercase tracking-widest text-[10px] text-white hover:bg-stratos-accent/10 hover:text-stratos-accent aria-selected:bg-stratos-accent/10 aria-selected:text-stratos-accent cursor-pointer group">
              <Settings className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Settings</span>
              <CommandShortcut className="text-[10px] font-mono text-stratos-muted">⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
