document.addEventListener('DOMContentLoaded', function() {
  const overviewButton = document.getElementById('overviewButton');
  const overlayContainer = document.getElementById('overlay-container');

  function closeOverlay() {
    const overlay = overlayContainer.querySelector('.overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Safely attach click handler to overviewButton
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
            // Show overlay
            overlay.style.display = 'flex';

            // Close when clicking outside the content
            overlay.addEventListener('click', function(event) {
              if (event.target === this) closeOverlay();
            });

            // Close button if present
            const closeButton = overlay.querySelector('.close-overlay');
            if (closeButton) closeButton.addEventListener('click', closeOverlay);
          }
        })
        .catch(err => console.log('Error loading overlay:', err));
    });
  }
});