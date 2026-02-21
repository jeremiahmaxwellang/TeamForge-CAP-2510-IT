// player_analysis_evaluation_overlay.js
// ONLY: DOM wiring + form handling. Requires EvaluationBackend loaded first.

window.initEvaluationTab = function (userId) {
  const Backend = window.EvaluationBackend;
  if (!Backend) {
    console.error("[EVALUATION] Backend module not loaded.");
    return;
  }

  console.log("[EVALUATION] Tab logic initialized for user:", userId);

  const form = document.getElementById("evalForm");
  if (!form) {
    console.error("[EVALUATION] Form not found in DOM.");
    return;
  }

  // Load existing evaluation
  Backend.fetchEvaluation(userId)
    .then((evalData) => {
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
    .catch((err) => console.error("[EVALUATION] Error loading evaluation:", err));

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const data = {
      comment: formData.get("comment"),
      ratingGameSense: formData.get("gameSense"),
      ratingCommunication: formData.get("communication"),
      ratingChampionPool: formData.get("champPool"),
      coachId: 2, // TODO: replace with logged-in coach
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
