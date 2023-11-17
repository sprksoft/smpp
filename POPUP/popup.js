//popupjs
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("profileSelector").addEventListener("change", function() {
      var selectedProfile = document.getElementById("profileSelector").value;
      console.log("Chosen profile: " + selectedProfile);
        localStorage.setItem("selectedProfile", selectedProfile);
  
    });
  });