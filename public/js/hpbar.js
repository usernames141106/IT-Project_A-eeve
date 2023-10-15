// Function to update the HP bar and change the color depending on the value (currently not working)
function updateHPBar(percentage) {
  const hpBar = document.getElementById("hp-bar");
  hpBar.style.width = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "red";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "green";
  }
}

const hpValue = 5; // Alter the HP value
updateHPBar(hpValue);

