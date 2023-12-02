document.getElementById('buttonSearch').addEventListener('click', function() {
  var selectedPokemon = document.getElementById('zoekPokemon').innerHTML;
  console.log(selectedPokemon);
 
  var pokemon = PokemonList.find(p => p.name === selectedPokemon);
 
  if(pokemon) {
    document.getElementById('pokemonImage').src = pokemon.image;
  }
 });
 