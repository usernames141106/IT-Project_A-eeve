import { IPokemon, IUser } from "./interface";
import bcrypt from 'bcrypt';
import { MongoClient, Collection } from "mongodb";


const uri: string = "mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

export let PokemonList: IPokemon[] = []; // constiable pokemons from api

async function getUserCollectionFromMongoDB(): Promise<Collection> {
    return await client.db("itProject").collection('Players');
}

export async function RegisterUserInDB(email: string, password: string) {
    try {
        await client.connect();

        const indexOfAtSymbol = email.indexOf("@");
        let username = email.substring(0, indexOfAtSymbol);

        bcrypt.hash(password, 20, async function (err, hash) {
            const newUser: IUser = {
                name: username,
                email: email,
                passwordHash: hash,
                pokemons: [],
                currentPokemon: undefined
            }
            const collection: Collection = await getUserCollectionFromMongoDB();
            await collection.insertOne(newUser);
        });
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
        let user: any = await collection.findOne({ email: email });
        if (user != null) {
            bcrypt.compare(password, user.passwordHash, function (err, result) {
                if (result) {
                    outputUser = user;
                }
            });
        }
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