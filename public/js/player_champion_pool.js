/**
 * CHAMPION POOL TEMP FILE: player_champion_pool.js
 * - I moved this code from player_analysis.js to here cuz it's not working properly (Jer)
 * 
 * - todo: allow the Champion Pool overlay backend to fetch the champion pool
 * - may need to move this to player_analysis.js to work
 */


document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("table tbody");

    console.log("champion pool script");
    
    getChampionPool(4);

    function getChampionPool(userId) {
        console.log("champion pool script");
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
            })
            .catch(err => console.error("Error loading champion pool:", err));
    }

});