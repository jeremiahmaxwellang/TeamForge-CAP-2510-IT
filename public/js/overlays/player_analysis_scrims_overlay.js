// player_analysis_scrims_overlay.js
// ONLY: DOM wiring + form handling. Requires EvaluationBackend loaded first.

window.initScrimsTab = function (userId) {
  const Backend = window.ScrimsBackend;
  if (!Backend) {
    console.error("[SCRIMS] Backend module not loaded.");
    return;
  }

  console.log("[SCRIMS] Tab logic initialized for user:", userId);

  const form = document.getElementById("evalForm");
  if (!form) {
    console.error("Eval Form not found in DOM.");
    return;
  }

   // Load existing scrims
  Backend.fetchScrims(userId)
    .then((scrims) => {
      const tableBody = document.querySelector(".scrim-table tbody");

      tableBody.innerHTML = "";

      scrims.forEach((scrim, index) => {
        const row = document.createElement("tr");

        if(scrim.win === "W") row.classList.add("scrim-win");
        else if(scrim.win === "L") row.classList.add("scrim-loss");

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${scrim.name}</td>
          <td>${scrim.date}</td>
          <td>${scrim.length}</td>
          <td>${scrim.playerId}</td>
          <td>${scrim.win || ""}</td>
          <td><a href="${scrim.videoLink}" target="_blank">Watch</a></td>
        `;

        row.addEventListener("click", () => {
          [...tableBody.rows].forEach(r => r.classList.remove("scrim-selected"));
          row.classList.add("scrim-selected");

          row.setAttribute("data-scrim-id", scrim.scrimId);
          updateEvaluation(scrim.scrimId);
          
        });

        tableBody.appendChild(row);
      });

      console.log("[SCRIMS] ✓ Table populated with scrim data");

      if (scrims.length > 0) { 
        const firstScrimId = scrims[0].scrimId; 

        updateEvaluation(firstScrimId);
      }
    })
    .catch((err) => console.error("[SCRIMS] ✗ Error loading scrims:", err));


    function updateEvaluation(scrimId) {
       // Load existing evaluation
      Backend.fetchEvaluation(userId, scrimId)
        .then((evalData) => {
          document.getElementById("player-evaluation-title").innerHTML = `Evaluation: ${evalData.name}`;

          if (evalData.ratingGameSense) {
            document.querySelector(`input[name="gameSense"][value="${evalData.ratingGameSense}"]`).checked = true;
          }
          if (evalData.ratingCommunication) {
            document.querySelector(`input[name="communication"][value="${evalData.ratingCommunication}"]`).checked = true;
          }
          if (evalData.ratingChampionPool) {
            document.querySelector(`input[name="champPool"][value="${evalData.ratingChampionPool}"]`).checked = true;
          }
          if (evalData.comment) {
            document.getElementById("coachComment").value = evalData.comment;
          }
          console.log("[EVALUATION] ✓ Form pre-filled with evaluation data");
        })
        .catch((err) => {
          console.error("[EVALUATION] Error loading evaluation:", err);

          [...document.querySelectorAll('input[name="gameSense"], input[name="communication"], input[name="champPool"]')] 
            .forEach(input => input.checked = false);

          document.getElementById("coachComment").value = "";
      });
    }
 

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const ratingGameSense = formData.get("gameSense");
    const ratingCommunication = formData.get("communication");
    const ratingChampionPool = formData.get("champPool");

    // TODO: replace with logged-in coach
    const data = {
      comment: formData.get("comment"),
      ratingGameSense: parseInt(ratingGameSense, 10),
      ratingCommunication: parseInt(ratingCommunication, 10),
      ratingChampionPool: parseInt(ratingChampionPool, 10),
      coachId: parseInt(2, 10), 
      scrimId: parseInt(scrimId, 10)
    };

    try {
      const result = await Backend.saveEvaluation(userId, data);
      
      if (result.success) {
        alert("Evaluation saved!");
        const evalData = result.evaluation;
        if (evalData) {
          document.querySelector(`input[name="gameSense"][value="${evalData.ratingGameSense}"]`).checked = true;
          document.querySelector(`input[name="communication"][value="${evalData.ratingCommunication}"]`).checked = true;
          document.querySelector(`input[name="champPool"][value="${evalData.ratingChampionPool}"]`).checked = true;
          document.getElementById("coachComment").value = evalData.comment;
        }
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("[EVALUATION] ✗ Error submitting evaluation:", err);
      alert("Failed to save evaluation.");
    }
  });
};
