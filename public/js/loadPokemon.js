fetch("/pokemonList")
  .then(response => response.json())
  .then(PokemonList => {
    document.getElementById('buttonSearch').addEventListener('click', function () {
      var selectedPokemon = document.getElementById('zoekPokemon').value;

      var pokemon = PokemonList.find(p => p.name === selectedPokemon);

      if (pokemon) {
        document.getElementById('pokemonImage').src = pokemon.image;
      }
    });
  });