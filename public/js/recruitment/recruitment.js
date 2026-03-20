// Get current application period
async function loadCurrentPeriod() {
    try {
        const response = await fetch('/recruitment/getperiod');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const periodDiv = document.getElementById('currentPeriod');

        if (result.applicationPeriod) {
            const { startDate, endDate } = result.applicationPeriod;
            // periodDiv.textContent = `Recruitment period: ${startDate} to ${endDate}`;
            // periodDiv.classList.remove('error-message');
            return result.applicationPeriod;   // ✅ return the object
        } else {
            // periodDiv.textContent = result.message || 'No active recruitment period';
            // periodDiv.classList.add('error-message');
            return null;   // ✅ return null if no active period
        }
    } catch (err) {
        console.error("Error fetching current period:", err);
        // const periodDiv = document.getElementById('currentPeriod');
        // periodDiv.textContent = 'Error loading recruitment period';
        // periodDiv.classList.add('error-message');
        return null;   // ✅ return null on error
    }
}
