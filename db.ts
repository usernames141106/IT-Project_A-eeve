import { IPokemon, IUser } from "./interface";
import { MongoClient, Collection } from "mongodb";


const uri = "mongodb+srv://berrietalboom:webontwikkeling@cluster0.1xbqwl8.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);

export let PokemonList: IPokemon[] = []; // constiable pokemons from api

async function getUserCollectionFromMongoDB(): Promise<Collection> {
    return await client.db("itProject").collection('Players');
}

export async function RegisterUserInDB(email: string, password: string) {
    try {
        const indexOfAtSymbol = email.indexOf("@");
        let username = email.substring(0, indexOfAtSymbol);

        await client.connect();
        const newUser: IUser = {
            name: username,
            email: email,
            passwordHash: password,
            pokemons: [],
            currentPokemon: undefined
        }

        const collection: Collection = await getUserCollectionFromMongoDB();
        await collection.insertOne(newUser);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
}



export async function LoadUserFromMongoDB(email: string, password: string): Promise<IUser | null> {
    let outputUser: IUser | null = null;
    try {
        await client.connect();
        const collection: Collection = await getUserCollectionFromMongoDB();
        outputUser = await collection.findOne<IUser>({ email: email });
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
        return outputUser;
    }
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