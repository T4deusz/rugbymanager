class Game {
    constructor() {
        // NOUVEAU : On définit l'année de départ du jeu
        this.currentYear = 2024; 

        this.mainMenu = document.getElementById('mainMenu');
        this.gameInterface = document.getElementById('gameInterface');

        this.views = {
            league: document.getElementById('leagueView'),
            club: document.getElementById('clubView'),
            player: document.getElementById('playerView'),
            match: document.getElementById('matchView'),
            standings: document.getElementById('standingsView')
        };
    }

    async init() {
        console.log("Initialisation de Rugby Manager...");
        const dbLoaded = await window.db.loadAll();
        
        if (dbLoaded) {
            console.log("Les fondations sont en place ! Jeu prêt !");
            window.competition.initLeague(101); 
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startGame());
        
        document.getElementById('loadGameBtn').addEventListener('click', () => {
            if(window.saveManager.loadFromLocal('slot1')) {
                this.startGame();
            }
        });
        
        document.getElementById('leagueBtn').addEventListener('click', () => this.showView('league'));
        document.getElementById('clubsBtn').addEventListener('click', () => this.showView('club'));
        document.getElementById('playersBtn').addEventListener('click', () => this.showView('player'));
        document.getElementById('standingsBtn').addEventListener('click', () => this.showView('standings'));
        document.getElementById('testMatchBtn').addEventListener('click', () => this.playNextMatchday());
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            window.saveManager.saveToLocal('slot1');
        });
    }

    startGame() {
        this.mainMenu.style.display = 'none';
        this.gameInterface.style.display = 'flex';
        this.showView('standings');
    }

    showView(viewName) {
        Object.values(this.views).forEach(view => {
            if(view) view.style.display = 'none';
        });
        
        if(this.views[viewName]) {
            this.views[viewName].style.display = 'block';
            
            if (viewName === 'league') this.renderLeagues();
            if (viewName === 'club') this.renderClubs();
            if (viewName === 'player') this.renderPlayers();
            if (viewName === 'standings') this.renderStandings(); 
        }
    }

    // NOUVEAU : Méthode de transition de saison !
    startNextSeason() {
        // 1. On avance d'une année
        this.currentYear++;

        // 2. Vieillissement de tous les joueurs de la base de données
        window.db.playersById.forEach(player => {
            if (player.age) player.age += 1;
        });

        // 3. Réinitialisation du championnat et du calendrier
        window.competition.initLeague(101);

        // 4. Notification au joueur
        alert(`Saison terminée ! Bienvenue dans la saison ${this.currentYear}-${this.currentYear + 1}. Tous les joueurs ont pris 1 an !`);
        
        // 5. Retour au classement qui est de nouveau vierge
        this.showView('standings');
    }

    renderStandings() {
        // NOUVEAU : On met à jour le titre H2 avec l'année en cours
        const title = document.querySelector('#standingsView h2');
        if (title) title.innerText = `Classement Top 14 (Saison ${this.currentYear}-${this.currentYear + 1})`;

        const container = document.getElementById('standingsContainer');
        const tableData = window.competition.getStandings(101); 

        let html = `
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>Pos</th><th>Club</th><th>J</th><th>V</th><th>N</th><th>D</th><th>BO/BD</th><th>Diff</th><th>Pts</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tableData.forEach((row, index) => {
            const diff = row.pointsFor - row.pointsAgainst;
            const diffSign = diff > 0 ? `+${diff}` : diff;
            
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${row.name}</td>
                    <td>${row.played}</td>
                    <td>${row.won}</td>
                    <td>${row.drawn}</td>
                    <td>${row.lost}</td>
                    <td>${row.bonus}</td>
                    <td>${diffSign}</td>
                    <td class="col-points">${row.points}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    playNextMatchday() {
        const schedule = window.competition.getCalendar(101);
        if (!schedule) return;

        const matchesToPlay = schedule.rounds[schedule.currentRound];
        const roundNumber = schedule.currentRound + 1;
        
        let resultsHTML = `<h3 style="font-size: 24px; color: #aaa; text-align: center; margin-bottom: 20px;">TOP 14 - JOURNÉE ${roundNumber}</h3>`;

        if (matchesToPlay) {
            matchesToPlay.forEach(match => {
                const result = window.matchEngine.simulate(match.home, match.away);
                window.competition.updateStandings(101, match.home, match.away, result.homeScore, result.awayScore);

                resultsHTML += `
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                        <div style="font-size: 18px; font-weight: bold; flex: 1; text-align: right;">${result.homeTeam}</div>
                        <div style="font-size: 20px; background: #1e1e24; padding: 5px 15px; border-radius: 4px; border: 1px solid #4caf50;">
                            ${result.homeScore} - ${result.awayScore}
                        </div>
                        <div style="font-size: 18px; font-weight: bold; flex: 1; text-align: left;">${result.awayTeam}</div>
                    </div>
                `;
            });
            schedule.currentRound++; 
        }

        let nextButtonHTML = '';
        if (schedule.currentRound < schedule.rounds.length) {
            nextButtonHTML = `<button onclick="window.game.playNextMatchday()" style="margin-right: 10px;">Jouer Journée ${schedule.currentRound + 1}</button>`;
        } else {
            // NOUVEAU : Le bouton pour déclencher la saison suivante
            nextButtonHTML = `
                <p style="color: #e74c3c; font-weight: bold; font-size: 20px; margin-bottom: 15px;">Saison ${this.currentYear}-${this.currentYear + 1} Terminée !</p>
                <button onclick="window.game.startNextSeason()" style="background-color: #f39c12; margin-right: 10px;">Passer à la saison suivante</button>
            `;
        }

        resultsHTML += `
            <div style="text-align: center; margin-top: 30px;">
                ${nextButtonHTML}
                <button onclick="window.game.showView('standings')" style="background-color: #3498db;">Voir le Classement</button>
            </div>
        `;

        this.showView('match');
        document.getElementById('matchResultBox').innerHTML = resultsHTML;
    }

    renderLeagues() {
        const leagueList = document.getElementById('leagueList');
        leagueList.innerHTML = ''; 
        window.db.leaguesById.forEach(league => {
            const country = window.db.countriesById.get(league.countryId);
            const countryName = country ? country.name : 'Pays inconnu';
            const div = document.createElement('div');
            div.className = 'list-card';
            div.innerHTML = `<h3>${league.name}</h3><p><strong>Pays :</strong> ${countryName} | <strong>Niveau :</strong> ${league.level}</p>`;
            leagueList.appendChild(div);
        });
    }

    renderClubs() {
        const clubList = document.getElementById('clubList');
        clubList.innerHTML = ''; 
        window.db.clubsById.forEach(club => {
            const league = window.db.leaguesById.get(club.leagueId);
            const leagueName = league ? league.name : 'Ligue inconnue';
            const div = document.createElement('div');
            div.className = 'list-card';
            div.innerHTML = `<h3>${club.name}</h3><p><strong>Ligue :</strong> ${leagueName} | <strong>Réputation :</strong> ${club.reputation}/20</p>`;
            clubList.appendChild(div);
        });
    }

    renderPlayers() {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = ''; 

        window.db.playersById.forEach(player => {
            const club = window.db.clubsById.get(player.clubId);
            const clubName = club ? club.name : 'Agent libre';
            const country = window.db.countriesById.get(player.nationalityId);
            const natName = country ? country.name : 'Inconnue';

            const div = document.createElement('div');
            div.className = 'list-card';
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="margin-bottom: 5px;">${player.name}</h3>
                        <p>
                            <strong>${player.position}</strong> | ${player.age} ans | ${player.height} cm | ${player.weight} kg<br>
                            <span style="color: #aaa;">${clubName} - ${natName}</span>
                        </p>
                    </div>
                    <button class="btn-edit" data-id="${player.id}">Éditer</button>
                </div>
                
                <div class="player-profile-grid">
                    <div class="stat-category">
                        <h4>Technique</h4>
                        <div class="stat-row"><span>Passe</span><span class="stat-val">${player.passing}</span></div>
                        <div class="stat-row"><span>Technique</span><span class="stat-val">${player.handling}</span></div>
                        <div class="stat-row"><span>Jeu au pied</span><span class="stat-val">${player.kicking}</span></div>
                        <div class="stat-row"><span>Plaquage</span><span class="stat-val">${player.tackling}</span></div>
                        <div class="stat-row"><span>Mêlée</span><span class="stat-val">${player.scrum}</span></div>
                        <div class="stat-row"><span>Touche</span><span class="stat-val">${player.lineout}</span></div>
                    </div>
                    <div class="stat-category">
                        <h4>Physique</h4>
                        <div class="stat-row"><span>Vitesse</span><span class="stat-val">${player.pace}</span></div>
                        <div class="stat-row"><span>Puissance</span><span class="stat-val">${player.strength}</span></div>
                        <div class="stat-row"><span>Endurance</span><span class="stat-val">${player.stamina}</span></div>
                    </div>
                    <div class="stat-category">
                        <h4>Mental</h4>
                        <div class="stat-row"><span>Vision</span><span class="stat-val">${player.vision}</span></div>
                        <div class="stat-row"><span>Discipline</span><span class="stat-val">${player.discipline}</span></div>
                        <div class="stat-row"><span>Leadership</span><span class="stat-val">${player.leadership}</span></div>
                    </div>
                </div>
            `;
            playerList.appendChild(div);
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.getAttribute('data-id'));
                window.editor.openPlayerEditor(playerId);
            });
        });
    }
}

window.game = new Game();
document.addEventListener('DOMContentLoaded', () => { window.game.init(); });