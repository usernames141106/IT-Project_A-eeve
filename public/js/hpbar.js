// Function to update the HP bar and change the color depending on the value (currently not working)
function updateHPBar(percentage) {
  const hpBar = document.getElementById("hp-bar");
  hpBar.style.width = percentage + "%";
  // hpBar.textContent = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "RGB(255,105,105)";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "lightgreen";
  }
}

function updateHPBarEnemy(percentage) {
  const hpBar = document.getElementById("hp-bar-enemy");
  hpBar.style.width = percentage + "%";
  // hpBar.textContent = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "RGB(255,105,105)";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "lightgreen";
  }
}

const hpValue = 100; // Alter the HP value
updateHPBar(hpValue);
updateHPBarEnemy(hpValue);

