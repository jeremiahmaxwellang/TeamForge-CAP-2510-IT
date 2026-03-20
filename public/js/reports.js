document.addEventListener('DOMContentLoaded', () => {

    fetch('/reports/applicant_roles')
        .then(r => r.json())
        .then(data => {
            const labels = data.map(p => p.displayedRole);
            const percentages = data.map(p => p.role_percentage);
            const roleColors = {
                Top: '#3b82f6',
                Mid: '#f59e0b',
                Jungle: '#9ca3af',
                "AD Carry": '#f97316',
                Support: '#128b0d'
            };

            // Role pie chart
            new Chart(document.getElementById('roleChart'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: labels.map(l => roleColors[l]),
                        borderWidth: 2, borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
                        }
                    }
                }
            });

            // Dynamically build legend
            const legendContainer = document.querySelector('.legend');
            legendContainer.innerHTML = labels.map(l => `
                <div class="legend-item">
                <div class="legend-dot" style="background:${roleColors[l]}"></div>${l}
                </div>
            `).join('');

        });


  fetch('/reports/current_players')
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('.role-table tbody');

      tbody.innerHTML = data.map(p => `
        <tr>
          <td>${p.displayedRole}</td>
          <td>${p.role_count}</td>
           <td class="${p.is_leaving >= 1 ? 'players-left-zero' : ''}">${p.is_leaving}</td>
          <td class="${p.players_left <= 1 ? 'players-left-zero' : ''}">${p.players_left}</td>
        </tr>
      `).join('');
    })
    .catch(err => console.error('Error loading current players:', err));


    
    // Accepted pie chart
    new Chart(document.getElementById('acceptChart'), {
        type: 'pie',
        data: {
            labels: ['Rejected', 'Accepted'],
            datasets: [{
                data: [77, 23],
                backgroundColor: ['#f97316', '#3b82f6'],
                borderWidth: 2, borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
                }
            }
        }
    });

});