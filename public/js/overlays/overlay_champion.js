/**
 * Player Analysis: Champion Pool Overlay Backend
 */

window.OverlayChampion = {
    init(userId) {
        this.getChampionPool(userId);
    },

    getChampionPool(userId) {
        console.log("champion pool script");
        const tableBody = document.querySelector("table tbody");

        if(!tableBody) {
            console.error("[CHAMPION OVERLAY] ✗ Table body not found in DOM");
            return;
        }

        fetch(`/player_analysis/players/${userId}/champion_pool`)
            .then(res => res.json())
            .then(championPool => {

                tableBody.innerHTML = "";

                championPool.forEach((champ, index) => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${champ.championName}</td>
                    <td>${champ.champ_role}</td>
                    <td>${champ.games}</td>
                    <td>${champ.winrate || "N/A"}</td> <!-- if you add WR later -->
                    <td>${champ.avg_kills} / ${champ.avg_deaths} / ${champ.avg_assists}</td>
                    <td>${champ.avg_csm}</td>
                    <td>${champ.avg_golddiff || "N/A"}</td> <!-- placeholder -->
                    <td>${champ.avg_damageshare}</td>
                    <td>${champ.avg_kp}</td>
                    `;

                    tableBody.appendChild(row);
                });
                console.log("[CHAMPION OVERLAY] ✓ Champion pool loaded successfully");
            })
            .catch(err => console.error("Error loading champion pool:", err));
    }

}