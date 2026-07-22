class SaveManager {
    constructor() {
        // Préfixe pour éviter les conflits dans le localStorage du navigateur
        this.saveKeyPrefix = 'rugby_manager_save_';
    }

    // 1. Convertit les Maps en objets normaux pour la sauvegarde
    serializeData() {
        return {
            countries: Array.from(window.db.countriesById.values()),
            leagues: Array.from(window.db.leaguesById.values()),
            clubs: Array.from(window.db.clubsById.values()),
            players: Array.from(window.db.playersById.values()),
            timestamp: new Date().toISOString()
        };
    }

    // 2. Vide la base de données actuelle et la remplace par la sauvegarde
    deserializeData(data) {
        window.db.countriesById.clear();
        window.db.leaguesById.clear();
        window.db.clubsById.clear();
        window.db.playersById.clear();

        window.db.populateMap(window.db.countriesById, data.countries);
        window.db.populateMap(window.db.leaguesById, data.leagues);
        window.db.populateMap(window.db.clubsById, data.clubs);
        window.db.populateMap(window.db.playersById, data.players);
    }

    // 3. Sauvegarde dans le navigateur (LocalStorage)
    saveToLocal(slot = 'autosave') {
        try {
            const data = this.serializeData();
            localStorage.setItem(this.saveKeyPrefix + slot, JSON.stringify(data));
            console.log(`Partie sauvegardée dans : ${slot}`);
            alert("Partie sauvegardée avec succès !");
            return true;
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            alert("Erreur de sauvegarde.");
            return false;
        }
    }

    // 4. Chargement depuis le navigateur (LocalStorage)
    loadFromLocal(slot = 'autosave') {
        try {
            const savedString = localStorage.getItem(this.saveKeyPrefix + slot);
            if (!savedString) {
                alert("Aucune sauvegarde trouvée dans ce slot.");
                return false;
            }
            
            const data = JSON.parse(savedString);
            this.deserializeData(data);
            console.log(`Partie chargée depuis : ${slot}`);
            alert("Partie chargée avec succès !");
            return true;
        } catch (error) {
            console.error("Erreur lors du chargement :", error);
            return false;
        }
    }

    // 5. Exporter la partie en fichier physique (.json) sur l'ordinateur
    exportSaveFile() {
        const data = this.serializeData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `rugby_manager_backup_${new Date().getTime()}.json`);
        
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

// On attache le manager à window pour l'utiliser partout
window.saveManager = new SaveManager();