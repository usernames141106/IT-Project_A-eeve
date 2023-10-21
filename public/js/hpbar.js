// Function to update the HP bar and change the color depending on the value (currently not working)
function updateHPBar(percentage) {
  const hpBar = document.getElementById("hp-bar");
  hpBar.style.width = percentage + "%";
  hpBar.textContent = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "red";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "green";
  }
}

function updateHPBarEnemy(percentage) {
  const hpBar = document.getElementById("hp-bar-enemy");
  hpBar.style.width = percentage + "%";
  hpBar.textContent = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "red";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "green";
  }
}

const hpValue = 100; // Alter the HP value
updateHPBar(hpValue);
updateHPBarEnemy(hpValue);

