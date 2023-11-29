export async function RegisterUserInDB(email: string, password: string) {
    try {
        await client.connect();
    
        const indexOfAtSymbol = email.indexOf("@");
        let username = email.substring(0, indexOfAtSymbol);

        bcyrpt.hash(password, 20, async function (err, hash) {
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