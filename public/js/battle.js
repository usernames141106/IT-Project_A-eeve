fetch("/PokemonList")
    .then(response => response.json())
    .then(PokemonList => {
        var battleWinForm = document.getElementById('battleWin');
        var battleLoseForm = document.getElementById('battleLose');
        var enemyPokemonName = document.getElementById('form1').value.toLowerCase();

        // enemyPokemonstats get loaded in from PokemonList
        var enemyPokemon = PokemonList.find(p => p.name === enemyPokemonName);
        let currentEnemyHP = enemyPokemon.maxHP;
        console.log(enemyPokemon);

        // ownPokemonstats get loaded in from PokemonList
        var ownPokemonAttack = document.getElementById('ownPokemonAttack').value;
        console.log(ownPokemonAttack);
        var ownPokemonDefence = document.getElementById('ownPokemonDefence').value;
        console.log(ownPokemonDefence);
        var ownPokemonHP = document.getElementById('ownPokemonHP').value;
        console.log(ownPokemonHP);
        let currentOwnHP = ownPokemonHP;

        console.log(ownPokemonAttack - enemyPokemon.defence);

        let ownLabel = document.getElementById("HPLabel");
        let enemyLabel = document.getElementById("HPLabelEnemy");

        // function to simulate an attack from your Pokémon
        function attackEnemyPokemon() {
            const damage = ownPokemonAttack - enemyPokemon.defence;

            currentEnemyHP = currentEnemyHP - damage;

            if (currentEnemyHP > 0) {
                enemyLabel.textContent = currentEnemyHP;
            } else {
                enemyLabel.textContent = 0;
                return;
            }
        }

        // function to simulate an attack from the enemy Pokémon
        function attackOwnPokemon() {
            const damage = enemyPokemon.attack - ownPokemonDefence;

            currentOwnHP = currentOwnHP - damage;

            if (currentOwnHP > 0) {
                ownLabel.textContent = currentOwnHP;
            } else if (currentOwnHP <= 0) {
                ownLabel.textContent = 0;
                return;
            }
        }

        let isOwnPokemonTurn = true;

        // function to perform a sequence of attacks from both Pokémon
        function battle() {
            const battleInterval = setInterval(() => {
                if (currentEnemyHP > 0 && isOwnPokemonTurn) {
                    attackEnemyPokemon();
                }
                if (currentOwnHP > 0 && !isOwnPokemonTurn) {
                    attackOwnPokemon();
                }

                isOwnPokemonTurn = !isOwnPokemonTurn;

                // stop the battle when one of the Pokemon is defeated
                if (currentOwnHP <= 0 || currentEnemyHP <= 0) {
                    clearInterval(battleInterval);
                    if (currentOwnHP <= 0) {
                        battleLoseForm.style.display = 'block';
                    } else {
                        battleWinForm.style.display = 'block';
                    }
                }
            }, 2000); // wait for 2 seconds between each attack
        }

        battle();

        // document.getElementById('hp-bar').style.width = "50%";
        // document.getElementById('HPLabel').textContent = enemyPokemon.maxHP;
    });



// // initialize HP values
// let ownPokemonHP = 100;
// let enemyPokemonHP = 100;
// let isOwnPokemonTurn = true;

// // set initial value for own HP bar
// const hpBar = document.getElementById("hp-bar");
// let label = document.getElementById("HPLabel");
// hpBar.style.width = ownPokemonHP + "%";
// label.textContent = ownPokemonHP;
// hpBar.style.backgroundColor = "lightgreen";

// // set initial value for the enemy HP bar
// const hpBarEnemy = document.getElementById("hp-bar-enemy");
// let labelEnemy = document.getElementById("HPLabelEnemy");
// hpBarEnemy.style.width = enemyPokemonHP + "%";
// labelEnemy.textContent = enemyPokemonHP;
// hpBarEnemy.style.backgroundColor = "lightgreen";

// // function to update the HP bar and change the color depending on the value
// function updateHPBar(percentage, barId) {
//   const hpBar = document.getElementById(barId);
//   let label = document.getElementById(`HPLabel${barId === "hp-bar" ? "" : "Enemy"}`);
//   hpBar.style.width = percentage + "%";
//   label.textContent = percentage;

//   if (percentage <= 10) {
//     hpBar.style.backgroundColor = "RGB(255,105,105)";
//   } else if (percentage <= 50) {
//     hpBar.style.backgroundColor = "orange";
//   } else {
//     hpBar.style.backgroundColor = "lightgreen";
//   }
// }

// // function to simulate an attack from your Pokémon
// function attackOwnPokemon() {
//   const damage = 30;
//   enemyPokemonHP -= damage;

//   if (enemyPokemonHP > 0) {
//     updateHPBar(enemyPokemonHP, "hp-bar-enemy");
//   } else if (enemyPokemonHP <= 0) {
//     enemyPokemonHP = 0;
//     updateHPBar(enemyPokemonHP, "hp-bar-enemy");
//     return;
//   }
// }

// // function to simulate an attack from the enemy Pokémon
// function attackEnemyPokemon() {
//   const damage = 40;
//   ownPokemonHP -= damage;

//   if (ownPokemonHP > 0) {
//     updateHPBar(ownPokemonHP, "hp-bar");
//   } else if (ownPokemonHP <= 0) {
//     ownPokemonHP = 0;
//     updateHPBar(ownPokemonHP, "hp-bar");
//   }
// }

// // function to perform a sequence of attacks from both Pokémon
// function battle() {
//   const battleInterval = setInterval(() => {
//     if (isOwnPokemonTurn && enemyPokemonHP > 0) {
//       attackOwnPokemon();
//     } else if (!isOwnPokemonTurn && ownPokemonHP > 0) {
//       attackEnemyPokemon();
//     } else {
//       clearInterval(battleInterval); // stop the battle when one of the Pokémon is defeated
//     }
//     isOwnPokemonTurn = !isOwnPokemonTurn;

//     if (ownPokemonHP <= 0 || enemyPokemonHP <= 0) {
//       clearInterval(battleInterval); // stop the battle when one of the Pokemon is defeated
//       if (ownPokemonHP <= 0) {
//         setTimeout(() => {
//           alert("Je pokémon is verloren! Game over.");
//         }, 2000);
//       } else {
//         setTimeout(() => {
//           alert("Je Pokémon is gewonnen! De vijand Pokémon is toegevoegd aan je collectie.");
//         }, 1000);
//       }
//     }
//   }, 1500); // wait for 1.5 seconds between each attack
// }

// // start the fight
// const fightButton = document.getElementById("fightButton");
// fightButton.addEventListener("click", () => {
//   hpBar.style.transition = "1s ease-out";  // fasten the animation
//   hpBarEnemy.style.transition = "1s ease-out";
//     battle();
// });



// TS
// // Initialize HP values
// let ownPokemonHP: number = 100;
// let enemyPokemonHP: number = 100;
// let isOwnPokemonTurn: boolean = true;

// // Set initial value for own HP bar
// const hpBar: HTMLElement | null = document.getElementById("hp-bar");
// let label: HTMLElement | null = document.getElementById("HPLabel");
// if (hpBar && label) {
//  hpBar.style.width = ownPokemonHP + "%";
//  label.textContent = ownPokemonHP.toString();
//  hpBar.style.backgroundColor = "lightgreen";
// }

// // Set initial value for the enemy HP bar
// const hpBarEnemy: HTMLElement | null = document.getElementById("hp-bar-enemy");
// let labelEnemy: HTMLElement | null = document.getElementById("HPLabelEnemy");
// if (hpBarEnemy && labelEnemy) {
//  hpBarEnemy.style.width = enemyPokemonHP + "%";
//  labelEnemy.textContent = enemyPokemonHP.toString();
//  hpBarEnemy.style.backgroundColor = "lightgreen";
// }

// // Function to update the HP bar and change the color depending on the value
// function updateHPBar(percentage: number, barId: string): void {
//  const hpBar: HTMLElement | null = document.getElementById(barId);
//  let label: HTMLElement | null = document.getElementById(`HPLabel${barId === "hp-bar" ? "" : "Enemy"}`);
//  if (hpBar && label) {
//    hpBar.style.width = percentage + "%";
//    label.textContent = percentage.toString();

//    if (percentage <= 10) {
//      hpBar.style.backgroundColor = "RGB(255,105,105)";
//    } else if (percentage <= 50) {
//      hpBar.style.backgroundColor = "orange";
//    } else {
//      hpBar.style.backgroundColor = "lightgreen";
//    }
//  }
// }

// // Function to simulate an attack from your Pokémon
// function attackOwnPokemon(): void {
//  const damage: number = 30;
//  enemyPokemonHP -= damage;

//  if (enemyPokemonHP > 0) {
//    updateHPBar(enemyPokemonHP, "hp-bar-enemy");
//  } else if (enemyPokemonHP <= 0) {
//    enemyPokemonHP = 0;
//    updateHPBar(enemyPokemonHP, "hp-bar-enemy");
//    return;
//  }
// }

// // Function to simulate an attack from the enemy Pokémon
// function attackEnemyPokemon(): void {
//  const damage: number = 40;
//  ownPokemonHP -= damage;

//  if (ownPokemonHP > 0) {
//    updateHPBar(ownPokemonHP, "hp-bar");
//  } else if (ownPokemonHP <= 0) {
//    ownPokemonHP = 0;
//    updateHPBar(ownPokemonHP, "hp-bar");
//  }
// }

// // Function to perform a sequence of attacks from both Pokémon
// function battle(): void {
//  const battleInterval: NodeJS.Timeout = setInterval(() => {
//    if (isOwnPokemonTurn && enemyPokemonHP > 0) {
//      attackOwnPokemon();
//    } else if (!isOwnPokemonTurn && ownPokemonHP > 0) {
//      attackEnemyPokemon();
//    } else {
//      clearInterval(battleInterval); // stop the battle when one of the Pokémon is defeated
//    }
//    isOwnPokemonTurn = !isOwnPokemonTurn;

//    if (ownPokemonHP <= 0 || enemyPokemonHP <= 0) {
//      clearInterval(battleInterval); // stop the battle when one of the Pokemon is defeated
//      if (ownPokemonHP <= 0) {
//        setTimeout(() => {
//          alert("Je pokémon is verloren! Game over.");
//        }, 2000);
//      } else {
//        setTimeout(() => {
//          alert("Je Pokémon is gewonnen! De vijand Pokémon is toegevoegd aan je collectie.");
//        }, 1000);
//      }
//    }
//  }, 1500); // wait for 1.5 seconds between each attack
// }

// // Start the fight
// const fightButton: HTMLElement | null = document.getElementById("fightButton");
// if (fightButton) {
//  fightButton.addEventListener("click", () => {
//    hpBar.style.transition = "1s ease-out"; // fasten the animation
//    hpBarEnemy.style.transition = "1s ease-out";
//    battle();
//  });
// }
