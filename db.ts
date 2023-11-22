import { IPokemon, IUser } from "./interface";


export let PokemonList: IPokemon[] = []; // constiable pokemons from api

export async function GetPokemonFromApi() {
    for (let index = 1; index <= 151; index++) {
        const rawData = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
        const jsonData = await rawData.json();
        PokemonList.push({
            id: index,
            name: jsonData.name,
            image: jsonData.sprites.other["official-artwork"].front_default,
            height: jsonData.height,
            weight: jsonData.weight,
            maxHP: jsonData.stats[0].base_stat,
            attack: jsonData.stats[1].base_stat,
            defence: jsonData.stats[2].base_stat,
            currentHp: undefined,
            wins: 0,
            losses: 0,
            captureDate: undefined
        });
    }
}



///////////////////////// Test Functies ////////////////////////////////////////////////////
async function testPokemonAPI() {
    console.table(PokemonList)
}
