import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import { IUser, IPokemon } from './interface';

const uri: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let Pokemons: IPokemon[] = [];
async function getPokemonCollection():Promise<Collection> {
    return await client.db("ItProject").collection("Pokemon");
}
let Users: IPokemon[] = [];
const UsersColection = client.db("ItProject").collection("Users");

// creates a hash
function cyrb53(str: string, seed: number = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export async function loadPokemon() {
    try {
        await client.connect();
        const collection: Collection = await getPokemonCollection();
        Pokemons = (await collection.find<IPokemon>({}).toArray());
        if (await Pokemons.length < 151) {
            for (let index = 1; index <= 151; index++) {
                const rawData = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
                const jsonData = await rawData.json();
                Pokemons.push({
                    id: index,
                    name: jsonData.name,
                    image: jsonData.sprites.other["official-artwork"].front_default,
                    height: jsonData.height,
                    weight: jsonData.weight,
                    maxHP: jsonData.stats[0].base_stat,
                    currentHp: undefined,
                    wins: 0,
                    losses: 0,
                    captureDate: undefined
                });
                collection.insertMany(Pokemons);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

export function getPokemonById(id: number): IPokemon {
    return Pokemons[Pokemons.findIndex((x) => x.id == id)];
}
