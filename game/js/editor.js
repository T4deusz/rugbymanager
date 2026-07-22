class GameEditor {
    constructor() {
        this.modal = null;
    }

    // Ouvre la fenêtre d'édition pour un joueur spécifique
    openPlayerEditor(playerId) {
        const player = window.db.playersById.get(playerId);
        if (!player) return;

        // Création de l'interface par-dessus le jeu
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <h2 style="margin-top: 0;">Éditer : ${player.name}</h2>
                
                <div class="form-group">
                    <label>Nom du joueur</label>
                    <input type="text" id="editName" value="${player.name}">
                </div>
                
                <div class="form-group">
                    <label>Âge</label>
                    <input type="number" id="editAge" value="${player.age}">
                </div>
                
                <div class="form-group">
                    <label>Passe (sur 20)</label>
                    <input type="number" id="editPassing" value="${player.passing}" min="1" max="20">
                </div>
                
                <div class="modal-buttons">
                    <button id="cancelEdit" style="background-color: #e74c3c;">Annuler</button>
                    <button id="saveEdit">Confirmer</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Ajout des actions sur les boutons
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.savePlayer(playerId));
    }

    // Applique les modifications à la base de données en mémoire
    savePlayer(playerId) {
        const player = window.db.playersById.get(playerId);
        
        // 1. On met à jour l'objet joueur avec les valeurs tapées
        player.name = document.getElementById('editName').value;
        player.age = parseInt(document.getElementById('editAge').value);
        player.passing = parseInt(document.getElementById('editPassing').value);
        
        // 2. On ferme la fenêtre
        this.closeModal();
        
        // 3. On demande au jeu de redessiner la liste pour voir les changements
        if (window.game) {
            window.game.renderPlayers();
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

// On attache l'éditeur à window
window.editor = new GameEditor();