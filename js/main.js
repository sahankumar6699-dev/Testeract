document.addEventListener('DOMContentLoaded', () => {
    // Navbar Mobile Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Quiz Timer Logic (if on quiz.html)
    const timerElement = document.getElementById('quiz-timer');
    if (timerElement) {
        let timeLeft = 60 * 60; // 60 minutes in seconds

        const updateTimer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(updateTimer);
                timerElement.textContent = "00:00";
                alert("Time is up! Submitting automatically.");
                // Add auto-submit logic here
            } else {
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                
                minutes = minutes < 10 ? '0' + minutes : minutes;
                seconds = seconds < 10 ? '0' + seconds : seconds;
                
                timerElement.textContent = `${minutes}:${seconds}`;
                timeLeft--;
            }
        }, 1000);
    }
});
