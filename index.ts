import express from 'express';
import session from 'express-session';
import { IPokemon, IUser } from './interface';
import { GetPokemonFromApi, LoadUserFromMongoDB, PokemonList, UpdateUserInDB } from './db';
import { RegisterUserInDB, coinFlip } from './db';

const evolutions: number[][] = require("./evolution-arrays.json");

const app = express();

app.use(session({
    secret: 'vz7%F654#oMAA3',
    resave: false,
    saveUninitialized: false
}));

declare module 'express-session' {
    interface SessionData {
        currentUser?: IUser
    }
};

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
            title: "Gelieve in te loggen",
            message: "Je moet ingelogd zijn om een project te openen.",
            currentUser: undefined
        });
    }
};

app.get("/home", isAuthenticated, (req, res) => {
    res.render("home", {
        currentUser: req.session.currentUser
    });
});

app.get("/noAccess", (req, res) => {
    res.render("message", {
        title: "Geen toegang",
        message: "Sorry, je hebt geen toegang tot dit project!",
        currentUser: req.session.currentUser
    });
});

app.get("/pokemonBattle", isAuthenticated, (req, res) => {
    let message: String | undefined;
    if (req.session.currentUser && req.session.currentUser.currentPokemon === undefined) {
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            pokemon1: undefined,
            currentUser: req.session.currentUser,
            req: req,
            message: "Je moet een huidige Pokémon hebben om te kunnen vechten."
        });
    }
    else {
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            pokemon1: undefined,
            currentUser: req.session.currentUser,
            req: req,
            message: message
        });
    }
});

app.post("/pokemonBattle", isAuthenticated, (req, res) => {
    let message: String | undefined;
    req.session.save(async (err) => {
        if (err) {
            // handle the error if session save fails
            console.error(err);
            return res.render("pokemonBattle", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: req.body.name1.toLowerCase(),
                req: req,
                message: "Er is iets fout gegaan, probeer het opnieuw."
            });
        }

        // render the same route after the session has been saved
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: req.body.name1.toLowerCase(),
            req: req,
            message: message
        });
    });
});

app.post("/battle", isAuthenticated, (req, res) => {
    let currentUser: IUser | undefined = req.session.currentUser;
    let currentPok: number | undefined = req.session.currentUser?.currentPokemon;
    let message: String | undefined;
    let winBattle: Boolean = false;
    let ownPokemon: IPokemon | undefined;

    // initiate own Pokémon stats and enemy Pokémon stats
    if (currentPok != undefined && currentUser != undefined) {
        ownPokemon = currentUser?.pokemons[currentPok];
    }

    const enemyPokemonName: String | undefined = req.body.btnFight;
    let enemyPokemon: IPokemon | undefined = PokemonList.find(x => x.name == enemyPokemonName);
    let enemyPokemonID = enemyPokemon?.id;

    if (enemyPokemon && ownPokemon) {
        let ownPokemonHP = ownPokemon.maxHP;
        let enemyPokemonHP = enemyPokemon.maxHP;
        // if one Pokémon can't damage the other (attack <= defence), the battle is automaticly decided
        if (ownPokemon.attack <= enemyPokemon.defence || enemyPokemon.attack <= ownPokemon.defence) {
            // if both Pokémon can't damage each other, return with a message
            if (ownPokemon.attack <= enemyPokemon.defence && enemyPokemon.attack <= ownPokemon.defence) {
                return res.render("pokemonBattle", {
                    PokemonList: PokemonList,
                    currentUser: req.session.currentUser,
                    pokemon1: enemyPokemonName,
                    enemyPokemonID: enemyPokemonID,
                    req: req,
                    message: "Gelijkspel! Beide Pokémon kunnen elkaar geen schade doen."
                });
            } else if (ownPokemon.attack <= enemyPokemon.defence) {
                winBattle = false;
            } else if (enemyPokemon.attack <= ownPokemon.defence) {
                winBattle = true;
            }
        } else {
            while (ownPokemonHP > 0 && enemyPokemonHP > 0) {
                // own Pokémon attacks
                enemyPokemonHP -= (ownPokemon.attack - enemyPokemon.defence)
                // enemy Pokémon attacks
                ownPokemonHP -= (enemyPokemon.attack - ownPokemon.defence)
            }
            if (ownPokemonHP <= 0) {
                winBattle = false;
            } else {
                winBattle = true;
            }
        }

        if (winBattle) {
            if (currentUser && currentPok) {
                currentUser.pokemons[currentPok].wins += 1;
            }
        } else {
            if (currentUser && currentPok) {
                currentUser.pokemons[currentPok].losses += 1;
            }
        }

        return res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            enemyPokemonID: enemyPokemonID,
            req: req,
            message: undefined
        });
    } else if (ownPokemon == undefined) {
        // return an error when the enemy Pokémon is undefined
        return res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            enemyPokemonID: enemyPokemonID,
            req: req,
            message: "Je moet een huidige Pokémon hebben om te kunnen vechten."
        });
    } else if (enemyPokemon == undefined) {
        // return an error when the user has no Pokémon
        return res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            enemyPokemonID: enemyPokemonID,
            req: req,
            message: "Selecteer een vijand Pokémon."
        });
    }

    req.session.save(async (err) => {
        if (err) {
            // handle the error if session save fails
            console.error(err);
            return res.render("pokemonBattle", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: enemyPokemonName,
                enemyPokemonID: enemyPokemonID,
                req: req,
                message: "Er is iets fout gegaan, probeer het opnieuw."
            });
        }

        // if al previous paths fail, return to pokemonBattle with an error message
        res.render("pokemonBattle", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: enemyPokemonName,
            enemyPokemonID: enemyPokemonID,
            req: req,
            message: "Er is iets fout gegaan, probeer het opnieuw."
        });
    });
});

app.post("/battleWin", (req, res) => {
    const pokemonId: Number = Number(req.body.pokemon);
    let pokemon: IPokemon | undefined = PokemonList.find(x => x.id == pokemonId);
    pokemon = pokemon ? pokemon : PokemonList[132];

    res.render("pokemonCatchSuccess", {
        Pokemon: pokemon,
        currentUser: req.session.currentUser
    });
});

app.get("/pokemonList", (req, res) => {
    res.type('application/json');
    res.json(PokemonList);
});

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
    // get the correct Pokémon name from the form
    const correctPokemonName: string | undefined = req.body.correctPokemon.toLowerCase();
    // get the guessed Pokémon name from the form
    const guessedPokemonName: string | undefined = req.body.pokeGuess.toLowerCase();
    // check if the guessed Pokémon is correct
    const isCorrectGuess: Boolean = (correctPokemonName === guessedPokemonName);
    // check if user has current Pokémon 
    const haspokemonselected: Boolean = !(req.session.currentUser?.currentPokemon === undefined);

    let currentpok: number | undefined = req.session.currentUser?.currentPokemon
    let message = "";

    if (isCorrectGuess == haspokemonselected) {

        if (currentpok !== undefined && req.session.currentUser?.pokemons !== undefined) {
            let coinflip: number = coinFlip();

            if (coinflip === 0) {
                if (req.session.currentUser && req.session.currentUser.pokemons && req.session.currentUser.pokemons[currentpok]) {
                    req.session.currentUser.pokemons[currentpok].attack += 1; // increment attack
                    message = `Juist! Aanval +1`
                    await UpdateUserInDB(req.session.currentUser);
                }

            } else if (coinflip === 1) {
                if (req.session.currentUser && req.session.currentUser.pokemons && req.session.currentUser.pokemons[currentpok]) {
                    req.session.currentUser.pokemons[currentpok].defence += 1; // increment defence
                    message = `Juist! Verdediging +1`
                    await UpdateUserInDB(req.session.currentUser);
                }
            }
        }
    }
    else if (isCorrectGuess && !(haspokemonselected)) {
        message = "JUIST"
    }
    else {
        message = "FOUT"
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
    let pokemon: IPokemon | undefined = JSON.parse(JSON.stringify(PokemonList)).find((x: IPokemon) => x.id == pokemonId);
    // json parse is used to delete the references so that PokemonList can't be altered
    // this way, the original name of the Pokemon stays the same
    const previouslyOwnedPokemonOfThisType: IPokemon | undefined = req.session.currentUser?.pokemons.find(x => x.id == pokemonId);
    if (pokemon && req.session.currentUser && previouslyOwnedPokemonOfThisType === undefined) {
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
        if (currentPokemonAttack) {
            const chance: number = ((100 - pokemon.defence) + currentPokemonAttack) / 100;
            if (Math.random() <= chance) {
                res.render("pokemonCatchSuccess", {
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
    let pokemonId: number = Number(req.query.id);
    let pokemon: IPokemon | undefined = [...PokemonList].find(x => x.id == pokemonId);

    pokemon = pokemon ? pokemon : PokemonList[132];
    pokemonId = pokemon ? pokemon.id : pokemonId;

    const evolutionPath: IPokemon[] | undefined = evolutions.find((x) => x.includes(pokemonId))?.map(x => PokemonList[x - 1]);

    res.render("pokemonDetail", {
        currentUser: req.session.currentUser,
        Pokemon: pokemon,
        evolutionPath: evolutionPath,
    });
});

app.get("/mypokemon", isAuthenticated, async (req, res) => {
    const owned: boolean = req.query.owned == "true";
    const newCurrentPokemon: number | undefined = req.session.currentUser?.pokemons.findIndex(x => x.id == Number(req.query.newCurrentPokemon));
    if (req.session.currentUser && (newCurrentPokemon !== undefined && newCurrentPokemon != -1 || req.query.newCurrentPokemon === "undefined")) {
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
            // handle the error if session save fails
            console.error(err);
            return res.render("pokemonvergelijken", {
                PokemonList: PokemonList,
                currentUser: req.session.currentUser,
                pokemon1: req.body.name1.toLowerCase(),
                pokemon2: req.body.name2.toLowerCase(),
            });
        }

        // render the same route after the session has been saved
        res.render("pokemonvergelijken", {
            PokemonList: PokemonList,
            currentUser: req.session.currentUser,
            pokemon1: req.body.name1.toLowerCase(),
            pokemon2: req.body.name2.toLowerCase()
        });
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check if user already exists
    let user: IUser | null = await LoadUserFromMongoDB(email, password);
    if (user != null) {
        const userS: IUser = user;
        req.session.regenerate(err => {
            req.session.currentUser = userS;
            res.redirect("back");
        });
    }
    else {
        req.session.destroy(err => {
            res.render("message", {
                title: "Login onsuccessvol",
                message: "Mail en / of wachtwoord is verkeerd.",
                currentUser: undefined
            });
        })
    }
});

app.post("/register", async (req, res) => {
    const { email, passworda, passwordb } = req.body;
    if (passworda == passwordb && passworda && email && email.includes('@')) {
        await RegisterUserInDB(email, passworda);
        let user: IUser | null = await LoadUserFromMongoDB(email, passworda);
        if (user != null) {
            const userS: IUser = user;
            req.session.regenerate(err => {
                req.session.currentUser = userS;
                res.redirect("back");
            });
        }
        else {
            res.sendStatus(500);
        }
    }
    else {
        res.render("message", {
            title: "Ongeldig wachtwoord of email",
            message: "Beide wachtwoorden moeten hetzelfde zijn en de mail moet een @ bevatten.",
            currentUser: undefined
        });
    }
});

app.post("/logout", async (req, res) => {
    if (req.session.currentUser) {
        // update user in MongoDB and destroy session
        await UpdateUserInDB(req.session.currentUser);
        req.session.destroy(err => {
            console.log(err);
            res.redirect("back");
        });
    } else {
        // redirect to "back" if no currentUser in session
        res.redirect("back");
    }
});

app.use((req, res, next) => {
    res.status(404).render("message", {
        title: "404 Error",
        message: "Deze pagina is niet gevonden.",
        currentUser: req.session.currentUser
    });
    res.status(500).render("message", {
        title: "500 Error",
        message: "Interne server error.",
        currentUser: req.session.currentUser
    });
});

app.listen(app.get("port"), async () => {
    await GetPokemonFromApi();
    console.log(`Local url: http://localhost:${app.get("port")}`);
});