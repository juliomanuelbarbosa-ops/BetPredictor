export const STATSBOMB_BASE_URL = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data';

export async function getStatsBombCompetitions() {
    try {
        const res = await fetch(`${STATSBOMB_BASE_URL}/competitions.json`);
        if (!res.ok) throw new Error('Failed to fetch competitions');
        return await res.json();
    } catch (error) {
        console.error("StatsBomb API Error:", error);
        return [];
    }
}

export async function getStatsBombMatches(competitionId: number, seasonId: number) {
    try {
        const res = await fetch(`${STATSBOMB_BASE_URL}/matches/${competitionId}/${seasonId}.json`);
        if (!res.ok) throw new Error('Failed to fetch matches');
        return await res.json();
    } catch (error) {
        console.error("StatsBomb API Error:", error);
        return [];
    }
}

export async function getStatsBombLineups(matchId: number) {
    try {
        const res = await fetch(`${STATSBOMB_BASE_URL}/lineups/${matchId}.json`);
        if (!res.ok) throw new Error('Failed to fetch lineups');
        return await res.json();
    } catch (error) {
        console.error("StatsBomb API Error:", error);
        return [];
    }
}

export async function getStatsBombEvents(matchId: number) {
    try {
        const res = await fetch(`${STATSBOMB_BASE_URL}/events/${matchId}.json`);
        if (!res.ok) throw new Error('Failed to fetch events');
        return await res.json();
    } catch (error) {
        console.error("StatsBomb API Error:", error);
        return [];
    }
}

export async function getStatsBombMatchSummary(matchId: number) {
    try {
        const events = await getStatsBombEvents(matchId);
        if (!events || events.length === 0) return null;

        let homeTeam = "";
        let awayTeam = "";
        let homeGoals = 0;
        let awayGoals = 0;
        let homeShots = 0;
        let awayShots = 0;
        let homePasses = 0;
        let awayPasses = 0;

        events.forEach((event: any) => {
            if (event.type.name === "Starting XI") {
                if (!homeTeam) homeTeam = event.team.name;
                else if (!awayTeam && event.team.name !== homeTeam) awayTeam = event.team.name;
            }

            if (event.type.name === "Shot") {
                if (event.team.name === homeTeam) homeShots++;
                else awayShots++;

                if (event.shot.outcome.name === "Goal") {
                    if (event.team.name === homeTeam) homeGoals++;
                    else awayGoals++;
                }
            }

            if (event.type.name === "Pass") {
                if (event.team.name === homeTeam) homePasses++;
                else awayPasses++;
            }
        });

        return {
            homeTeam,
            awayTeam,
            homeGoals,
            awayGoals,
            homeShots,
            awayShots,
            homePasses,
            awayPasses,
            totalEvents: events.length
        };
    } catch (error) {
        console.error("StatsBomb Match Summary Error:", error);
        return null;
    }
}
