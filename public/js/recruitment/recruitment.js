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
            return result.applicationPeriod;
        } else {
            return null;   // return null if no active period
        }
    } catch (err) {
        console.error("Error fetching current period:", err);
        return null;   // return null on error
    }
}
