import { Bot, Send, Terminal, Cpu, Zap, Shield, Search, TrendingUp, AlertTriangle, Network, Copy, Check, RefreshCw, Brain, Database, Activity, Target } from 'lucide-react';

export interface Agent {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    color: string;
    model: string;
    systemInstruction: string;
    useThinking?: boolean;
    useSearch?: boolean;
    useStatsBomb?: boolean;
    useFreeApis?: boolean;
    role?: string;
}

export const AGENTS: Agent[] = [
    { 
        id: 'master', 
        name: 'Master Orchestrator', 
        icon: Cpu, 
        description: 'Multi-agent tactical coordination', 
        color: 'text-stratos-accent',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Master Orchestrator. Your objective is absolute precision in quantitative sports forecasts. You allocate analytical tasks to specialized sub-agents. 1. Deconstruct the user query into raw probabilistic components. 2. Establish a tactical quantitative plan. 3. Dispatch specific data extraction workflows to News, Market, and Risk sub-agents. 4. Synthesize their outputs into a final, EV-positive execution matrix. Speak cold, precise, and data-driven truth.',
        useThinking: true,
        useSearch: true,
        role: 'Orchestrator'
    },
    { 
        id: 'news', 
        name: 'News Analyst', 
        icon: Search, 
        description: 'Real-time injury & squad news', 
        color: 'text-blue-400',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Tactical Event-Driven agent. You index high-impact asymmetry: catastrophic injuries, sudden manager sackings, training ground leaks, and off-pitch physiological factors. Ignore fluff. Only report variables that fracture the bookmaker\'s implied probability.',
        useSearch: true,
        role: 'Analyst'
    },
    { 
        id: 'market', 
        name: 'Market Liquidity', 
        icon: TrendingUp, 
        description: 'Odds movement & sharp money', 
        color: 'text-purple-400',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Market Liquidity agent. Your focus is global liquidity and sharp syndicate activity. Track dropping odds, Asian Handicap spreads, and volume spikes. Identify where institutional money is positioned and map the true closing line.',
        useSearch: true,
        role: 'Liquidity'
    },
    { 
        id: 'risk', 
        name: 'Risk Manager', 
        icon: Shield, 
        description: 'Bankroll & Kelly optimization', 
        color: 'text-red-400',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Risk Manager. Capital preservation is your supreme directive. Calculate exact fractional Kelly allocations. Never advise chasing losses. Provide strict portfolio constraints, covariance analysis, and hedge strategies.',
        role: 'Manager'
    },
    {
        id: 'deep-thinker',
        name: 'Deep Reasoning',
        icon: Brain,
        description: 'Complex tactical & statistical analysis',
        color: 'text-yellow-400',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Deep Reasoning cluster. Calculate multi-dimensional tactical mismatches, expected goals (xG) discrepancies, and PPDA differentials. Build complex, step-by-step mathematical proofs supporting your EV models. You are the ultimate quantitative brain.',
        useThinking: true,
        role: 'Thinker'
    },
    {
        id: 'statsbomb',
        name: 'StatsBomb Expert',
        icon: Database,
        description: 'Event-level data analysis',
        color: 'text-pink-400',
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are the SPARTA Event-Level Analyst. Mine hyper-granular pitch coordinate data, pass network centrality, and defensive action maps. Translate raw pitch events into exploitable betting angles.',
        useStatsBomb: true,
        role: 'Expert'
    },
    {
        id: 'claw-code',
        name: 'Claw Code Agent',
        icon: Terminal,
        description: 'Agent harness for codebase analysis and tasks',
        color: 'text-orange-400',
        model: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are SPARTA System Architecture. Your mandate is to optimize logic, refine quantitative forecasting algorithms, and execute low-latency data processing code. Eliminate inefficiency. Design robust data pipelines and execute mathematically flawless TypeScript operations.',
        useThinking: true,
        useSearch: true,
        role: 'Harness'
    }
];
