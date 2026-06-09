import { db } from '../firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export interface TeamMemory {
    teamId: string;
    shortTerm: {
        recentForm: number; // 0-100
        momentum: number; // -1 to +1
        lastMatchResult: 'W' | 'D' | 'L' | null;
        fatigue: number; // 0-100
    };
    mediumTerm: {
        tacticalAdaptability: number; // 0-100
        managerTrust: number; // 0-100
        injuryImpact: number; // 0-100
    };
    longTerm: {
        historicalResilience: number; // 0-100
        derbyPerformance: number; // 0-100
        coreChemistry: number; // 0-100
    };
    updatedAt: string;
}

export class TeamMemorySystem {
    private memoryCol = collection(db, 'team_memory');

    async getMemory(teamName: string): Promise<TeamMemory | null> {
        const teamId = `team_${teamName.replace(/\s+/g, '_').toLowerCase()}`;
        const snap = await getDoc(doc(this.memoryCol, teamId));
        if (snap.exists()) {
            return snap.data() as TeamMemory;
        }
        return null;
    }

    async updateMemory(memory: TeamMemory): Promise<void> {
        await setDoc(doc(this.memoryCol, memory.teamId), memory);
    }

    // Default memory for a new team
    getDefaultMemory(teamName: string): TeamMemory {
        return {
            teamId: `team_${teamName.replace(/\s+/g, '_').toLowerCase()}`,
            shortTerm: {
                recentForm: 50,
                momentum: 0,
                lastMatchResult: null,
                fatigue: 0
            },
            mediumTerm: {
                tacticalAdaptability: 50,
                managerTrust: 50,
                injuryImpact: 0
            },
            longTerm: {
                historicalResilience: 50,
                derbyPerformance: 50,
                coreChemistry: 50
            },
            updatedAt: new Date().toISOString()
        };
    }
}

export const teamMemorySystem = new TeamMemorySystem();
