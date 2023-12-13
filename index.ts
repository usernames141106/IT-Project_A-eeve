import express from 'express';
import session from 'express-session';
import { IPokemon, IUser } from './interface';
import { GetPokemonFromApi, LoadUserFromMongoDB, PokemonList, UpdateUserInDB, GetEvolutions } from './db';
import { RegisterUserInDB, coinFlip } from './db';


const app = express();

app.use(session({
    secret: 'blabla',
    resave: false,
    saveUninitialized: false
}));

declare module 'express-session' {
    interface SessionData {
        currentUser?: IUser
    }
}

app.use(express.static("public"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootstrapIcons', express.static(__dirname + '/node_modules/bootstrap-icons/icons'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("port", 3000);

app.get("/", (req, res) => {
    res.render("index", {
        currentUser: req.session.currentUser
    });
});

function isAuthenticated(req: any, res: any, next: any) {
    if (req.session.currentUser) {
        next();
    } else {
        res.render("message", {
            title: "Gelieve in te loggen.",
            message: "Je moet ingelogd zijn om een project te openen.",
            currentUser: undefined
        });
    }
}

app.get("/home", isAuthenticated, (req, res) => {
    res.render("home", {
        currentUser: req.session.currentUser
    });
});

app.get("/noAccess", (req, res) => {
    res.render("message", {
        title: "Geen toegang",
        message: "Sorry, je hebt helaas geen toegang tot dit project!",
        currentUser: req.session.currentUser
    });
});

app.get("/pokemonBattle", isAuthenticated, (req, res) => {
    let errorMessage: String | undefined;
    res.render("pokemonBattle", {
        PokemonList: PokemonList,
        pokemon1: undefined,
        currentUser: req.session.currentUser,
        req: req,
        errorMessage: errorMessage
    });
});

app.post("/pokemonBattle", isAuthenticated, (req, res) => {
    let errorMessage: String | undefined;
    req.session.save(async (err) => {
        if (err) {
            // Handle the error if session save fails
            console.error(err);
            return res.render("pokemonBattle", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: req.body.name1,
                req: req,
                errorMessage: "Er is iets fout gegaan, probeer het opnieuw."
            });
        }

        // Render the same route after the session has been saved
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: req.body.name1,
            req: req,
            errorMessage: errorMessage
        });
    });
});

app.post("/battle", isAuthenticated, (req, res) => {
    let errorMessage: String | undefined;
    let winBattle: Boolean = false;

    // Initiate own Pokémon stats and enemy Pokémon stats
    const ownPokemonName = req.body.ownPokemon;
    let ownPokemon: IPokemon | undefined = PokemonList.find(x => x.id == ownPokemonName);
    console.log(ownPokemon);
    const enemyPokemonName: String | undefined = req.body.btnFight;
    let enemyPokemon: IPokemon | undefined = PokemonList.find(x => x.name == enemyPokemonName);
    console.log(enemyPokemon);

    if (enemyPokemon && ownPokemon) {
        let ownPokemonHP = ownPokemon.maxHP;
        let enemyPokemonHP = enemyPokemon.maxHP;
        // If one Pokémon can't damage the other (attack <= defence), the battle is automaticly decided
        if (ownPokemon.attack <= enemyPokemon.defence || enemyPokemon.attack <= ownPokemon.defence) {
            if (ownPokemon.attack <= enemyPokemon.defence) {
                winBattle = false;
            } else if (enemyPokemon.attack <= ownPokemon.defence) {
                winBattle = true;
            }
        } else {
            while (ownPokemonHP > 0 && enemyPokemonHP > 0) {
                // Own Pokémon attacks
                enemyPokemonHP -= (ownPokemon.attack - enemyPokemon.defence)
                // Enemy Pokémon attacks
                ownPokemonHP -= (enemyPokemon.attack - ownPokemon.defence)
            }
            if (ownPokemonHP <= 0) {
                winBattle = false;
            } else {
                winBattle = true;
            }
        }

        // Win the battle -> catch the enemy Pokémon
        // Lose the battle -> "try again with another Pokémon"
        if (winBattle) {
            res.render("pokemonCatchSuccess", {
                Pokemon: enemyPokemon,
                currentUser: req.session.currentUser
            });
        } else {
            return res.render("pokemonBattle", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: enemyPokemonName,
                req: req,
                errorMessage: "Je verliest de strijd. Probeer het met een andere Pokémon of maak je huidige Pokémon sterker."
            });
        }
    } else if (enemyPokemon == undefined) {
        // Return an error when the enemy Pokémon is undefined
        return res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            req: req,
            errorMessage: "Selecteer een vijand Pokémon."
        });
    } else if (ownPokemon == undefined) {
        // Return an error when the user has no Pokémon
        return res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            req: req,
            errorMessage: "Je moet eerst een eigen Pokémon hebben."
        });
    }

    req.session.save(async (err) => {
        if (err) {
            // Handle the error if session save fails
            console.error(err);
            return res.render("pokemonBattle", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: enemyPokemonName,
                req: req,
                errorMessage: "Er is iets fout gegaan, probeer het opnieuw."
            });
        }

        // setTimeout(() => {}, 10000);
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            req: req,
            errorMessage: errorMessage
        });
    });
});

app.get("/pokemonList", (req, res) => {
    res.type('application/json');
    res.json(PokemonList);
})

app.get("/whosthatpokemon", isAuthenticated, (req, res) => {

    res.render("whosThatPokemon", {
        PokemonList: PokemonList,
        searchvalue: undefined,
        correctpokemon: undefined,
        message: undefined,
        currentUser: req.session.currentUser
    });
});


app.post("/whosthatpokemon", isAuthenticated, async (req, res) => {
    // Get the correct Pokemon name from the form
    const correctPokemonName: number | undefined = req.body.correctPokemon;
    // Get the guessed Pokemon name from the form
    const guessedPokemonName = req.body.pokeGuess;
    // Check if the guessed Pokemon is correct
    const isCorrectGuess = (correctPokemonName === guessedPokemonName);
    // Check if user has current pokemon 
    const haspokemonselected = !(req.session.currentUser?.currentPokemon == undefined);

    let test: IPokemon[] | undefined = req.session.currentUser?.pokemons
    let currentpok: number | undefined = req.session.currentUser?.currentPokemon

    let message;

    if (isCorrectGuess == true && haspokemonselected == true) {
        message = "Correct"
        if (currentpok !== undefined && req.session.currentUser?.pokemons !== undefined) {
            let coinflip: number = coinFlip();
            console.log(coinflip);
            if (coinflip === 0) {
                if (req.session.currentUser && req.session.currentUser.pokemons && req.session.currentUser.pokemons[currentpok]) {
                    req.session.currentUser.pokemons[currentpok].attack += 1; // Increment attack
                    await UpdateUserInDB(req.session.currentUser);
                }

            } else if (coinflip === 1) {
                if (req.session.currentUser && req.session.currentUser.pokemons && req.session.currentUser.pokemons[currentpok]) {
                    req.session.currentUser.pokemons[currentpok].defence += 1; // Increment defence
                    await UpdateUserInDB(req.session.currentUser);
                }
            }
        }
    }
    else if (isCorrectGuess == true && haspokemonselected == false) {
        message = "Correct"
    }
    else {
        message = "Incorrect"
    }

    res.render("whosThatPokemon", {
        PokemonList: PokemonList,
        currentUser: req.session.currentUser,
        message: message,
    });
});

app.post("/rename", isAuthenticated, async (req, res) => {
    const targetPokemon: IPokemon | undefined = req.session.currentUser?.pokemons.find(x => x.id == Number(req.body.pokemonId));
    if (targetPokemon && req.session.currentUser) {
        targetPokemon.name = String(req.body.nickname);
        await UpdateUserInDB(req.session.currentUser);
    }
    res.redirect(`back`);
});

app.get("/alterWinsAndLosses", isAuthenticated, async (req, res) => {
    const { id, wins, add } = req.query;
    const pokemon: IPokemon | undefined = req.session.currentUser?.pokemons.find(x => x.id == Number(id));
    if (pokemon && req.session.currentUser) {
        const winsOrLosses = wins == "true" ? "wins" : "losses";
        pokemon[winsOrLosses] += add == "true" ? 1 : pokemon[winsOrLosses] <= 0 ? 0 : -1;
        await UpdateUserInDB(req.session.currentUser);
    }
    res.redirect(`back`);
});

app.post("/pokemonRelease", isAuthenticated, async (req, res) => {
    const pokemonId: Number = Number(req.body.pokemon);
    if (req.session.currentUser) {
        const currentPokemonIndex: number | undefined = req.session.currentUser.currentPokemon !== undefined ? req.session.currentUser.pokemons[req.session.currentUser.currentPokemon].id : undefined;
        req.session.currentUser.pokemons = req.session.currentUser.pokemons.filter(x => x.id != pokemonId);
        if (currentPokemonIndex !== undefined) {
            const newCurrentPokemonIndex = req.session.currentUser.pokemons.findIndex(x => currentPokemonIndex == x.id);
            req.session.currentUser.currentPokemon = newCurrentPokemonIndex !== -1 ? newCurrentPokemonIndex : undefined;
        }
        await UpdateUserInDB(req.session.currentUser);
    }
    res.redirect(`/pokemonCatch?id=${pokemonId}`);
});

app.get("/pokemonRelease", isAuthenticated, (req, res) => {
    const pokemonId: Number = Number(req.query.id);
    let pokemon: IPokemon | undefined = req.session.currentUser?.pokemons.find(x => x.id == pokemonId);
    if (pokemon) {
        res.render("pokemonRelease", {
            Pokemon: pokemon,
            currentUser: req.session.currentUser
        });
    }
    else {
        res.redirect(`/pokemonCatch?id=${pokemonId}`);
    }
});

app.post("/pokemonCatchSuccess", isAuthenticated, async (req, res) => {
    const pokemonId: Number = Number(req.body.pokemon);
    let pokemon: IPokemon | undefined = PokemonList.find(x => x.id == pokemonId);
    if (pokemon && req.session.currentUser) {
        pokemon.name = req.query.useDefault == "true" ? pokemon.name : req.body.name;
        req.session.currentUser?.pokemons.push({ ...pokemon, captureDate: new Date(Date.now()) });
        await UpdateUserInDB(req.session.currentUser);
    }
    res.redirect(`/pokemonCatch?id=${pokemonId}`);
});

app.get("/pokemonCatch", isAuthenticated, (req, res) => {
    const pokemonId: Number = Number(req.query.id);
    let pokemon: IPokemon | undefined = PokemonList.find(x => x.id == pokemonId);
    pokemon = pokemon ? pokemon : PokemonList[132];

    const attempt: number = req.query.attempt ? Number(req.query.attempt) : 0;
    if (attempt >= 1 && req.session.currentUser) {
        if (attempt >= 3) {
            res.redirect("/mypokemon");
        }
        const currentPokemonAttack: number = req.session.currentUser.currentPokemon ? req.session.currentUser.pokemons[req.session.currentUser.currentPokemon].attack : 0;
        const chance: number = ((100 - pokemon.defence) + currentPokemonAttack) / 100;
        if (Math.random() <= chance) {
            res.render("pokemonCatchSuccess", {
                Pokemon: pokemon,
                currentUser: req.session.currentUser
            });
        }
        else {
            res.render("pokemonCatch", {
                attempt: attempt,
                Pokemon: pokemon,
                currentUser: req.session.currentUser
            });
        }
    }
    else {
        res.render("pokemonCatch", {
            attempt: attempt,
            Pokemon: pokemon,
            currentUser: req.session.currentUser
        });
    }
});

app.get("/pokemondetail", isAuthenticated, (req, res) => {
    const pokemonId: Number = Number(req.query.id);
    let pokemon: IPokemon | undefined = [...PokemonList].find(x => x.id == pokemonId);
    pokemon = pokemon ? pokemon : PokemonList[132];

    res.render("pokemonDetail", {
        currentUser: req.session.currentUser,
        Pokemon: pokemon
    });
});

//////////////////////
GetEvolutions('charmeleon');
///////////////

app.get("/mypokemon", isAuthenticated, async (req, res) => {
    const owned: boolean = req.query.owned == "true";
    const newCurrentPokemon: number | undefined = req.session.currentUser?.pokemons.findIndex(x => x.id == Number(req.query.newCurrentPokemon));
    if (newCurrentPokemon !== undefined && newCurrentPokemon != -1 && req.session.currentUser) {
        req.session.currentUser.currentPokemon = newCurrentPokemon;
        await UpdateUserInDB(req.session.currentUser);
    }
    res.render("myPokemon", {
        currentUser: req.session.currentUser,
        PokemonList: PokemonList,
        viewAllPokemon: owned
    });
});

app.get("/pokemonvergelijken", isAuthenticated, (req, res) => {

    res.render("pokemonvergelijken", {
        PokemonList: PokemonList,
        pokemon1: undefined,
        pokemon2: undefined,
        currentUser: req.session.currentUser
    });
});

app.post("/pokemonvergelijken", isAuthenticated, (req, res) => {
    req.session.save(async (err) => {
        if (err) {
            // Handle the error if session save fails
            console.error(err);
            return res.render("pokemonvergelijken", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: req.body.name1,
                pokemon2: req.body.name2,
                errorMessage: "Er is iets fout gegaan, probeer het opnieuw."
            });
        }

        // Render the same route after the session has been saved
        res.render("pokemonvergelijken", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: req.body.name1,
            pokemon2: req.body.name2
        });
    });
});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    //check if excists
    let user: IUser | null = await LoadUserFromMongoDB(email, password);
    if (user != null) {
        const userS: IUser = user;
        req.session.regenerate(err => {
            req.session.currentUser = userS;
            res.redirect("/home"); //later te verranderen 
        });
    }
    else {
        req.session.destroy(err => {
            console.log("gebruiker niet gevonden")
            res.redirect("/");
        })
    }
});

app.post("/register", async (req, res) => {
    const { email, passworda, passwordb } = req.body;
    if (passworda == passwordb && passworda != undefined) {
        await RegisterUserInDB(email, passworda);
    }
    res.redirect("/");
});

app.post("/logout", async (req, res) => {
    if (req.session.currentUser) {
        // Update user in MongoDB and destroy session
        await UpdateUserInDB(req.session.currentUser);
        req.session.destroy(err => {
            console.log(err);
            res.redirect("/");
        });
    } else {
        // Redirect to "/" if no currentUser in session
        res.redirect("/");
    }
});
app.use((req, res, next) => {
    res.status(404).render("message", {
        title: "404 Error",
        message: "Deze pagina is niet gevonden.",
        currentUser: req.session.currentUser
    });
});

app.listen(app.get("port"), async () => {
    await GetPokemonFromApi();
    console.log(`Local url: http://localhost:${app.get("port")}`);
});