async function scrapePlayers() {
    console.log("Démarrage du scraper LNR...");
    const playersDatabase = [];
    let currentId = 50002; // On commence après Antoine Dupont

    try {
        const targetUrl = 'https://top14.lnr.fr/joueurs';
        console.log(`Téléchargement de la page : ${targetUrl}`);
        
        const response = await axios.get(targetUrl);
        const $ = cheerio.load(response.data);

        // 1. On cible chaque carte de joueur (.player-block)
        $('.player-block').each((index, element) => {
            
            // 2. Extraction du nom complet
            const name = $(element).find('.player-block__name').text().trim();
            
            // 3. Extraction du poste (en enlevant les espaces superflus)
            const position = $(element).find('.player-block__position').text().trim();
            
            // 4. Extraction du Club et du Pays depuis l'attribut "alt" des images
            const clubName = $(element).find('.player-block__club').attr('alt');
            const natName = $(element).find('.player-block__country').attr('alt');

            if (name) {
                const player = {
                    id: currentId++,
                    // On fait correspondre le texte avec tes IDs
                    clubId: clubIds[clubName] || 9999, 
                    nationalityId: natIds[natName] || 1, 
                    
                    name: name,
                    position: position,
                    age: generateRandomStat(20, 34), // Âge aléatoire pour l'instant
                    
                    // Génération des stats
                    passing: generateRandomStat(10, 20),
                    vision: generateRandomStat(10, 20),
                    kicking: generateRandomStat(5, 18),
                    pace: generateRandomStat(10, 19),
                    strength: generateRandomStat(12, 20),
                    discipline: generateRandomStat(5, 20),
                    leadership: generateRandomStat(5, 20),
                    handling: generateRandomStat(10, 20),
                    scrum: position.includes('ligne') ? generateRandomStat(15, 20) : generateRandomStat(1, 10),
                    lineout: position.includes('ligne') ? generateRandomStat(12, 20) : generateRandomStat(1, 10)
                };

                playersDatabase.push(player);
                console.log(`Extrait : ${player.name} - ${position} (${clubName}) - ${natName}`);
            }
        });

        const outputPath = '../data/players_scraped.json';
        fs.writeFileSync(outputPath, JSON.stringify(playersDatabase, null, 4), 'utf8');
        
        console.log(`\nSuccès ! ${playersDatabase.length} joueurs extraits et sauvegardés dans ${outputPath}`);

    } catch (error) {
        console.error("Erreur lors du scraping :", error.message);
    }
}