class MatchEngine {
    
    // 1. NOUVEAU : Calcule l'Overall caché d'un joueur (sur 100)
    calculatePlayerOverall(player) {
        // On additionne les 12 caractéristiques actuelles
        const totalStats = (player.passing || 10) + 
                           (player.handling || 10) + 
                           (player.kicking || 10) + 
                           (player.tackling || 10) + 
                           (player.scrum || 10) + 
                           (player.lineout || 10) +
                           (player.pace || 10) + 
                           (player.strength || 10) + 
                           (player.stamina || 10) +
                           (player.vision || 10) + 
                           (player.discipline || 10) + 
                           (player.leadership || 10);
        
        // Total max : 12 * 20 = 240. On divise par 2.4 pour ramener l'Overall sur 100.
        return totalStats / 2.4;
    }

    // 2. NOUVEAU : Calcule la force du "XV de départ" du club
    calculateTeamPower(clubId) {
        const team = window.db.clubsById.get(clubId);
        if (!team) return 50; // Valeur moyenne par défaut si le club n'existe pas

        // On récupère tous les joueurs appartenant à ce club
        const clubPlayers = Array.from(window.db.playersById.values())
                                .filter(p => p.clubId === clubId);

        // Si le club n'a pas de joueurs (ex: les clubs non moddés), on utilise la réputation
        if (clubPlayers.length === 0) {
            return team.reputation * 5; 
        }

        // Sinon, on calcule l'overall de chaque joueur du club
        const playerOveralls = clubPlayers.map(p => this.calculatePlayerOverall(p));

        // On trie du meilleur au moins bon
        playerOveralls.sort((a, b) => b - a);

        // On isole les 15 meilleurs (le fameux XV type)
        const startingXV = playerOveralls.slice(0, 15);

        // On calcule la moyenne de ce XV
        const sum = startingXV.reduce((acc, val) => acc + val, 0);
        return sum / startingXV.length;
    }

    // 3. MISE À JOUR : La simulation utilise les joueurs
    simulate(homeClubId, awayClubId) {
        const homeTeam = window.db.clubsById.get(homeClubId);
        const awayTeam = window.db.clubsById.get(awayClubId);

        if (!homeTeam || !awayTeam) {
            console.error("Erreur : Clubs introuvables pour le match.");
            return null;
        }

        // La force de base est maintenant calculée par les attributs des joueurs !
        let homePower = this.calculateTeamPower(homeClubId); 
        let awayPower = this.calculateTeamPower(awayClubId);

        // Avantage du terrain (+5 points de force)
        homePower += 5;

        // Facteur chance / Forme du jour (entre -10 et +10)
        homePower += this.getRandomVariance();
        awayPower += this.getRandomVariance();

        const score = this.calculateRugbyScore(homePower, awayPower);

        return {
            homeTeam: homeTeam.name,
            awayTeam: awayTeam.name,
            homeScore: score.home,
            awayScore: score.away,
            powerDiff: Math.round(homePower - awayPower) // Math.round pour un affichage propre
        };
    }

    getRandomVariance() {
        return Math.floor(Math.random() * 21) - 10;
    }

    calculateRugbyScore(homePower, awayPower) {
        let homeScore = 0;
        let awayScore = 0;
        const diff = homePower - awayPower;

        if (diff > 10) {
            homeScore = this.generateScore(20, 45);
            awayScore = this.generateScore(3, 15);
        } else if (diff < -10) {
            homeScore = this.generateScore(6, 15);
            awayScore = this.generateScore(20, 40);
        } else {
            const baseScore = this.generateScore(12, 25);
            if (diff > 0) {
                homeScore = baseScore + this.generateScore(3, 7);
                awayScore = baseScore;
            } else {
                homeScore = baseScore;
                awayScore = baseScore + this.generateScore(3, 7);
            }
        }

        return { home: homeScore, away: awayScore };
    }

    generateScore(min, max) {
        let score = Math.floor(Math.random() * (max - min + 1)) + min;
        if (score === 1 || score === 2 || score === 4) score = 3;
        return score;
    }
}

// On attache le moteur au contexte global
window.matchEngine = new MatchEngine();