// initialize elements to animate
// const divPokemon = document.getElementById("imageOwnPokemon");

// initialize HP values
let ownPokemonHP = 100;
let enemyPokemonHP = 100;
let isOwnPokemonTurn = true;

// set initial value for own HP bar
const hpBar = document.getElementById("hp-bar");
let label = document.getElementById("HPLabel");
hpBar.style.width = ownPokemonHP + "%";
label.textContent = ownPokemonHP;
hpBar.style.backgroundColor = "lightgreen";

// set initial value for the enemy HP bar
const hpBarEnemy = document.getElementById("hp-bar-enemy");
let labelEnemy = document.getElementById("HPLabelEnemy");
hpBarEnemy.style.width = enemyPokemonHP + "%";
labelEnemy.textContent = enemyPokemonHP;
hpBarEnemy.style.backgroundColor = "lightgreen";

// function to update the HP bar and change the color depending on the value
function updateHPBar(percentage, barId) {
  const hpBar = document.getElementById(barId);
  let label = document.getElementById(`HPLabel${barId === "hp-bar" ? "" : "Enemy"}`);
  hpBar.style.width = percentage + "%";
  label.textContent = percentage;

  if (percentage <= 10) {
    hpBar.style.backgroundColor = "RGB(255,105,105)";
  } else if (percentage <= 50) {
    hpBar.style.backgroundColor = "orange";
  } else {
    hpBar.style.backgroundColor = "lightgreen";
  }
}

// function to simulate an attack from your Pokémon
function attackOwnPokemon() {
  const damage = 30;
  enemyPokemonHP -= damage;
  updateHPBar(enemyPokemonHP, "hp-bar-enemy");

  if (enemyPokemonHP <= 0) {
    setTimeout(() => {
      alert("You defeated the enemy Pokémon! You win!");
    }, 2000);
    enemyPokemonHP == 0;
    return;
  }
}

// function to simulate an attack from the enemy Pokémon
function attackEnemyPokemon() {
  const damage = 30;
  ownPokemonHP -= damage;
  updateHPBar(ownPokemonHP, "hp-bar");

  if (ownPokemonHP <= 0) {
    setTimeout(() => {
      alert("Your Pokémon fainted. Game over!");
    }, 2000);
    ownPokemonHP == 0;
    return;
  }
}

// function to perform a sequence of attacks from both Pokémon
function battle() {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      if (isOwnPokemonTurn && enemyPokemonHP > 0) {
        // divPokemon.style.marginLeft = "100px";  // animate an attack
        attackOwnPokemon();
      } else if (!isOwnPokemonTurn && ownPokemonHP > 0) {
        attackEnemyPokemon();
      } else {
        return;
      }
      isOwnPokemonTurn = !isOwnPokemonTurn;
    }, i * 1500); // wait for 1,5 seconds between each attack
  }
}

// start the fight
const fightButton = document.getElementById("fightButton");
fightButton.addEventListener("click", () => {
  hpBar.style.transition = "1s ease-out";  // fasten the animation
  hpBarEnemy.style.transition = "1s ease-out";
  if (ownPokemonHP > 0 && enemyPokemonHP > 0) {
    battle();
  }
});