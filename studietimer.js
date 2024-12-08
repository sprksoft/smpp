document.addEventListener('DOMContentLoaded', () => {
    const weatherContainer = document.getElementById("weathercontainer");
    if (weatherContainer) {
        pass;
    }else{
        console.log("weathercontainer not found");
        return;
    }
  
    // Function to update the countdown
    function updateCountdown() {
      const currentTime = new Date();
      const targetTime = new Date();
      targetTime.setHours(17);
      targetTime.setMinutes(2);
      targetTime.setSeconds(0);
      targetTime.setMilliseconds(0);
  
      if (currentTime >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
  
      const timeDifference = targetTime - currentTime;
      const hours = Math.floor(timeDifference / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000).toString().padStart(2, '0');
  
      countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
  
    // Initialize and set the interval for updating the countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
  