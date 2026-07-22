class CompetitionManager {
    constructor() {
        this.standings = new Map(); 
        this.calendars = new Map(); // NOUVEAU : Stockage des calendriers
    }

    initLeague(leagueId) {
        const teams = Array.from(window.db.clubsById.values()).filter(c => c.leagueId === leagueId);
        
        const table = teams.map(t => ({
            clubId: t.id, name: t.name, played: 0, won: 0, drawn: 0, lost: 0,
            pointsFor: 0, pointsAgainst: 0, bonus: 0, points: 0
        }));

        this.standings.set(leagueId, table);
        
        // On génère le calendrier en même temps que le classement
        this.generateCalendar(leagueId);
    }

    // ALGORITHME DE ROUND-ROBIN (Tournoi à la ronde)
    generateCalendar(leagueId) {
        let teams = Array.from(window.db.clubsById.values()).filter(c => c.leagueId === leagueId).map(c => c.id);
        
        // Si le nombre d'équipes est impair, on ajoute un "fantôme" pour l'équipe exempte
        if (teams.length % 2 !== 0) teams.push(null);

        const totalRounds = teams.length - 1;
        const matchesPerRound = teams.length / 2;
        const rounds = [];

        // Génération de la phase Aller
        for (let round = 0; round < totalRounds; round++) {
            const matchday = [];
            for (let match = 0; match < matchesPerRound; match++) {
                const homeIndex = (round + match) % (teams.length - 1);
                let awayIndex = (teams.length - 1 - match + round) % (teams.length - 1);
                
                if (match === 0) awayIndex = teams.length - 1; // L'équipe fixe
                
                // Alternance domicile/extérieur pour l'équilibre
                if (match === 0 && round % 2 === 1) {
                    matchday.push({ home: teams[awayIndex], away: teams[homeIndex] });
                } else {
                    matchday.push({ home: teams[homeIndex], away: teams[awayIndex] });
                }
            }
            // On retire les matchs contre le "fantôme" (exemption)
            rounds.push(matchday.filter(m => m.home !== null && m.away !== null));
        }

        // Génération de la phase Retour (inversion des équipes)
        const returnRounds = rounds.map(matchday => matchday.map(m => ({ home: m.away, away: m.home })));

        // On stocke le tout dans notre Map
        this.calendars.set(leagueId, {
            currentRound: 0,
            rounds: [...rounds, ...returnRounds]
        });
    }

    updateStandings(leagueId, homeId, awayId, homeScore, awayScore) {
        const table = this.standings.get(leagueId);
        if (!table) return;

        const home = table.find(t => t.clubId === homeId);
        const away = table.find(t => t.clubId === awayId);

        home.played++; away.played++;
        home.pointsFor += homeScore; home.pointsAgainst += awayScore;
        away.pointsFor += awayScore; away.pointsAgainst += homeScore;

        let homeMatchPts = 0; let awayMatchPts = 0;

        if (homeScore > awayScore) {
            homeMatchPts = 4; home.won++; away.lost++;
            if (homeScore - awayScore >= 14) { homeMatchPts++; home.bonus++; } 
            if (homeScore - awayScore <= 7) { awayMatchPts++; away.bonus++; }  
        } else if (awayScore > homeScore) {
            awayMatchPts = 4; away.won++; home.lost++;
            if (awayScore - homeScore >= 14) { awayMatchPts++; away.bonus++; } 
            if (awayScore - homeScore <= 7) { homeMatchPts++; home.bonus++; }  
        } else {
            homeMatchPts = 2; awayMatchPts = 2;
            home.drawn++; away.drawn++;
        }

        home.points += homeMatchPts; away.points += awayMatchPts;

        table.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
    }

    getStandings(leagueId) { return this.standings.get(leagueId) || []; }
    getCalendar(leagueId) { return this.calendars.get(leagueId); }
}

window.competition = new CompetitionManager();