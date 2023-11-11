import mongoose from 'mongoose';
import { pokemonSchema } from './schema';

const url: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";

const pokemonModel = mongoose.model("pokemon", pokemonSchema);
async function loadPokemon() {
    await mongoose.connect(url);
    if (pokemonModel.length < 151) {
        for (let index = 1; index <= 151; index++) {
            const rawData = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
            const jsonData = await rawData.json();
            const pokemon = new pokemonSchema({
                id: index,
                name: jsonData.name,
                image: jsonData.sprites.other.official-artwork.front_default,
                height: jsonData.height,
                weight: jsonData.weight,
                maxHP: jsonData.stats[0].base_stat,
                currentHP: undefined,
                wins: 0,
                losses: 0,
                captureDate:undefined
            })
        }
    }
}
