import { MongoClient, Collection } from "mongodb";
import { IPokemon, IUser } from "./interface";

const uri: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let PokemonList: IPokemon[] = []; // variable pokemons from api
let User: IUser | null = null; // null betekent uitgelogd

async function getUserCollectionFromMongoDB(): Promise<Collection> {
    return await client.db("itProject").collection('Players');
}

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

export async function LoadUserFromMongoDB(name: string, password: string) {
    try {
        const passwordHash: string = cyrb53(password);
        await client.connect();

        const collection: Collection = await getUserCollectionFromMongoDB();
        User = await collection.findOne<IUser>({ name: name, passwordHash: passwordHash });
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
}

export async function UpdateUserInDB() {
    try {
        await client.connect();

        const collection: Collection = await getUserCollectionFromMongoDB();
        if (User != null) {
            await collection.updateOne({ _id: User?._id }, User);
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
}

export async function RegisterUserInDB(name: string, password: string) {
    try {
        await client.connect();
        const passwordHash: string = cyrb53(password);
        
        const collection: Collection = await getUserCollectionFromMongoDB();
        const user: IUser = {
            name: name,
            passwordHash: passwordHash,
            pokemons: []
        }
        await collection.insertOne(user);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
        await LoadUserFromMongoDB(name, password);  // geregistreerde gebruiker inloggen
    }
}

// zet een string om naar een code om het wachtwoord niet in plain text niet in de db op te slaan (een cyb53 hashalgoritme)
function cyrb53(str: string, seed: number = 531): string {
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

    return String(4294967296 * (2097151 & h2) + (h1 >>> 0));
};