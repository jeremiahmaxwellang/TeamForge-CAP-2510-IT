document.addEventListener('DOMContentLoaded', function() {
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

      fetch('/player_overview.html')
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

            if (closeButton) closeButton.addEventListener('click', closeOverlay);
          }
        })
        .catch(err => console.log('Error loading overlay:', err));
    });
  }
});