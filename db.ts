import mongoose, { Schema } from 'mongoose';
import { Ipokemon } from './interface';

const url: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";

const pokemonSchema = new Schema<Ipokemon>({
    id: {required: true, type: Number},
    name: {required: true, type: String},
    image: {required: true, type: String},
    height: {required: true, type: Number},
    weight: {required: true, type: Number},
    maxHP: {required: true, type: Number},
    currentHp: {required: false, type: Number},
    wins: {required: true, type: Number},
    losses: {required: true, type: Number},
    captureDate: {required: false, type: Date}
});

const Pokemon = mongoose.model<Ipokemon>("Pokemon", pokemonSchema);

export async function loadPokemon() {
    await mongoose.connect(url);
    if (await Pokemon.find({}).count() < 151) {
        for (let index = 1; index <= 151; index++) {
            const rawData = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
            const jsonData = await rawData.json();
            const pokemon = new Pokemon({
                id: index,
                name: jsonData.name,
                image: jsonData.sprites.other["official-artwork"].front_default,
                height: jsonData.height,
                weight: jsonData.weight,
                maxHP: jsonData.stats[0].base_stat,
                currentHP: undefined,
                wins: 0,
                losses: 0,
                captureDate:undefined
            });
            await pokemon.save();
        }
    }
}
