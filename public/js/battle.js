fetch("/PokemonList")
    .then(response => response.json())
    .then(PokemonList => {
        var battleWinForm = document.getElementById('battleWin');
        var battleLoseForm = document.getElementById('battleLose');
        var enemyPokemonName = document.getElementById('form1').value.toLowerCase();

        // enemyPokemonstats get loaded in from PokemonList
        var enemyPokemon = PokemonList.find(p => p.name === enemyPokemonName);
        let currentEnemyHP = enemyPokemon.maxHP;

        // ownPokemonstats get loaded in from PokemonList
        var ownPokemonAttack = document.getElementById('ownPokemonAttack').value;
        var ownPokemonDefence = document.getElementById('ownPokemonDefence').value;
        var ownPokemonHP = document.getElementById('ownPokemonHP').value;
        let currentOwnHP = ownPokemonHP;

        // HP labels
        let ownLabel = document.getElementById("HPLabel");
        let enemyLabel = document.getElementById("HPLabelEnemy");

        // HP bars
        const ownHPBar = document.getElementById("hp-bar");
        const enemyHPBar = document.getElementById("hp-bar-enemy");

        // function to simulate an attack from your Pokémon
        function attackEnemyPokemon() {
            if ((ownPokemonAttack - enemyPokemon.defence) > 0) {
                const damage = ownPokemonAttack - enemyPokemon.defence;

                currentEnemyHP = currentEnemyHP - damage;

                if (currentEnemyHP > 0) {
                    enemyLabel.textContent = currentEnemyHP;
                } else {
                    enemyLabel.textContent = 0;
                }
            }
        }

        // function to simulate an attack from the enemy Pokémon
        function attackOwnPokemon() {
            if ((enemyPokemon.attack - ownPokemonDefence) > 0) {
                const damage = enemyPokemon.attack - ownPokemonDefence;

                currentOwnHP = currentOwnHP - damage;

                if (currentOwnHP > 0) {
                    ownLabel.textContent = currentOwnHP;
                } else if (currentOwnHP <= 0) {
                    ownLabel.textContent = 0;
                }
            }
        }

        let isOwnPokemonTurn = true;

        // function to perform a sequence of attacks from both Pokémon
        function battle() {
            const battleInterval = setInterval(() => {
                if (currentEnemyHP > 0 && isOwnPokemonTurn) {
                    attackEnemyPokemon();
                    enemyHPBar.style.width = (currentEnemyHP / enemyPokemon.maxHP * 100) + "%";
                    if (enemyHPBar.style.width <= "10%") {
                        enemyHPBar.style.backgroundColor = "RGB(255,105,105)";
                    } else if (enemyHPBar.style.width <= "50%") {
                        enemyHPBar.style.backgroundColor = "orange";
                    }
                }
                if (currentOwnHP > 0 && !isOwnPokemonTurn) {
                    attackOwnPokemon();
                    ownHPBar.style.width = (currentOwnHP / ownPokemonHP * 100) + "%";
                    if (ownHPBar.style.width <= "10%") {
                        ownHPBar.style.backgroundColor = "RGB(255,105,105)";
                    } else if (ownHPBar.style.width <= "50%") {
                        ownHPBar.style.backgroundColor = "orange";
                    }
                }

                isOwnPokemonTurn = !isOwnPokemonTurn;

                // stop the battle when one of the Pokemon is defeated
                if (currentOwnHP <= 0 || currentEnemyHP <= 0) {
                    clearInterval(battleInterval);
                    if (currentOwnHP <= 0) {
                        ownHPBar.style.width = "0%";
                        setTimeout(() => {
                            battleLoseForm.style.display = 'block';
                        }, 1000);
                    } else if (currentEnemyHP <= 0) {
                        enemyHPBar.style.width = "0%";
                        setTimeout(() => {
                            battleWinForm.style.display = 'block';
                        }, 1000);
                    }
                }
            }, 1500); // wait for 1.5 seconds between each attack
        }

        battle();
    });