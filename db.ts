import { IPokemon, IUser } from "./interface";
import { MongoClient, Collection, ConnectionCheckOutFailedEvent } from "mongodb";

const uri = "mongodb+srv://berrietalboom:webontwikkeling@cluster0.1xbqwl8.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);

export let PokemonList: IPokemon[] = []; // constiable pokemons from api

async function getUserCollection(): Promise<Collection> {
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

        const collection: Collection = await getUserCollection();
        const existingUser = await collection.findOne({email: email});
        if(!(existingUser)) { // maakt zeker dat er geen nieuwe user gemaakt word met een bestaande email
            await collection.insertOne(newUser);
        }
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
        const collection: Collection = await getUserCollection();
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

// functie aangepest om email te gebruiken als unieke identifier en limieten te zeten op wat kan geupdate worden
/* gebruiksvoorbeeld in post of get functie
if(req.session.currentUser) {
    req.session.currentUser.name = newName;
    await UpdateUserInDB(req.session.currentUser);
}
*/
export async function UpdateUserInDB(user: IUser) {
    try {
        await client.connect();
        const collection: Collection = await getUserCollection();
        await collection.updateOne({ email: user.email }, {
            $set: {
                name: user.name,
                passwordHash: user.passwordHash,
                pokemons: user.pokemons,
                currentPokemon: user.currentPokemon
            }
        });
    } catch (e) {
        console.error(e)
    } finally {
        await client.close();
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