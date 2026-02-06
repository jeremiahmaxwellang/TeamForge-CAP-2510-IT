document.addEventListener('DOMContentLoaded', function() {
  console.log("event listener");

  // Load one player’s details into overlay
  function loadPlayer(playerId) {
      fetch(`/player_analysis/players/${playerId}`)
          .then(res => res.json())
          .then(player => {
              console.log("Fetched player:", player);

              const btn = document.getElementById("player-dropdown-btn");
              btn.textContent = `${player.gameName}#${player.tagLine} (${player.primaryRole})`;

              document.getElementById("primaryRole").textContent = `Primary Role: ${player.primaryRole}`;
              document.getElementById("secondaryRole").textContent = `Secondary Role: ${player.secondaryRole}`;

              document.getElementById("email").textContent = `Email: ${player.email}`;
              document.getElementById("discord").textContent = `Discord: ${player.discord}`;

              document.getElementById("schoolId").textContent = `School ID: ${player.schoolId}`;
              document.getElementById("course").textContent = `Course: ${player.course}`;
              document.getElementById("year").textContent = `Year: ${player.year}`; // i dont have this in the schema pala
          })
          .catch(err => console.error(err));
  }

  // Fetch all players and populate dropdown
  fetch('/player_analysis/players')
      .then(res => res.json())
      .then(players => {
          console.log("Players list:", players);
          const dropdownMenu = document.querySelector(".player-dropdown-menu");
          dropdownMenu.innerHTML = ""; // clear existing

          if(players.length > 0){
            loadPlayer(players[0].userId);
          }

          players.forEach(player => {
              const link = document.createElement("a");
              link.href = "#";
              link.textContent = player.gameName;
              link.addEventListener("click", () => loadPlayer(player.userId));
              dropdownMenu.appendChild(link);
          });
      })
      .catch(err => console.error(err));


// ===================  OVERLAY BACKEND  ============================
    const overviewButton = document.getElementById('overviewButton');
    const overlayContainer = document.getElementById('overlay-container');

    function closeOverlay() {
        const overlay = overlayContainer.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    }

  // Attach click handler to the overviewButton
  if (overviewButton && overlayContainer) {
    overviewButton.addEventListener('click', function(e) {
      e.preventDefault();

      fetch('/player_analysis/overview')
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.text();
        })
        .then(html => {
          overlayContainer.innerHTML = html;

          const overlay = overlayContainer.querySelector('.overlay');
          if (overlay) {
            // Show overlay under the buttons
            overlay.style.display = 'block'; // Show overlay below the navigation buttons

            // Close the overlay when clicking outside the content
            overlay.addEventListener('click', function(event) {
              if (event.target === this) closeOverlay();
            });

            const closeButton = overlayContainer.querySelector('.close-button');
            if (closeButton) closeButton.addEventListener('click', closeOverlay);
          }
        })
        .catch(err => console.log('Error loading overlay:', err));
    });
  }
});