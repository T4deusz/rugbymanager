class GameDatabase {
    constructor() {
        // Nos tables de hachage (Maps) pour un accès O(1) par ID
        this.countriesById = new Map();
        this.leaguesById = new Map();
        this.clubsById = new Map();
        this.playersById = new Map();
    }

    // Fonction principale appelée au démarrage
    async loadAll() {
        try {
            console.log("Chargement de la base de données...");
            
            // Chargement parallèle pour gagner du temps
            const [countries, leagues, clubs, players] = await Promise.all([
                this.fetchData('data/countries.json'),
                this.fetchData('data/leagues.json'),
                this.fetchData('data/clubs.json'),
                this.fetchData('data/players.json')
            ]);

            // Indexation dans nos Maps
            this.populateMap(this.countriesById, countries);
            this.populateMap(this.leaguesById, leagues);
            this.populateMap(this.clubsById, clubs);
            this.populateMap(this.playersById, players);

            console.log(`Données chargées : ${this.countriesById.size} Pays, ${this.leaguesById.size} Ligues, ${this.clubsById.size} Clubs, ${this.playersById.size} Joueurs.`);
            return true;

        } catch (error) {
            console.error("Erreur critique lors du chargement des données :", error);
            return false;
        }
    }

    // Utilitaire pour charger un fichier JSON
    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Impossible de charger ${url} (Statut: ${response.status})`);
        }
        return await response.json();
    }

    // Utilitaire pour insérer les données dans les Maps
    populateMap(map, dataArray) {
        if (!dataArray || !Array.isArray(dataArray)) return;
        dataArray.forEach(item => {
            map.set(item.id, item);
        });
    }
}

// On instancie la base de données pour qu'elle soit accessible partout
window.db = new GameDatabase();