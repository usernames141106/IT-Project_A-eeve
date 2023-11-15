import mongoose, { Schema, Types } from 'mongoose';
import { IUser, IPokemon } from './interface';

const url: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";

const pokemonSchema = new Schema<IPokemon>({
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
const userSchema = new Schema<IUser>({
    name: {required: true, type: String},
    passwordHash: {required: true, type: String},
    pokemons: {required: true, type: Types.DocumentArray<IPokemon>},
    currentPokemon: {required: true, type: Number}
});

const Pokemon = mongoose.model<IPokemon>("Pokemon", pokemonSchema);
const User = mongoose.model<IUser>("User");

// creates a hash
function cyrb53(str:string, seed:number = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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
