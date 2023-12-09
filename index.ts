import express from 'express';
import session from 'express-session';
import { IPokemon, IUser } from './interface';
import { GetPokemonFromApi, LoadUserFromMongoDB, PokemonList, UpdateUserInDB } from './db';
import { RegisterUserInDB } from './db';

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
    res.render("pokemonBattle", {
        PokemonList: PokemonList,
        pokemon1: undefined,
        pokemon2: undefined,
        currentUser: req.session.currentUser
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


app.post("/whosthatpokemon", isAuthenticated, (req, res) => {

    // Get the correct Pokemon name from the form
    const correctPokemonName: number | undefined = req.body.correctPokemon;
    console.log(correctPokemonName)
    // Get the guessed Pokemon name from the form
    const guessedPokemonName = req.body.pokeGuess;
    console.log(guessedPokemonName)
    // Check if the guessed Pokemon is correct
    const isCorrectGuess = (correctPokemonName === guessedPokemonName);
    console.log(isCorrectGuess);
    //check if user has current pokemon 
    const haspokemonselected = !(req.session.currentUser?.currentPokemon == undefined)
    console.log(haspokemonselected);

    let test: IPokemon[] | undefined = req.session.currentUser?.pokemons
    let testcurrentpok: number | undefined = req.session.currentUser?.currentPokemon

    console.log(test + "---------------------------------");

    let message

    if (isCorrectGuess == true && haspokemonselected == true) {
        message = "Correct"

        console.log("pokemon stats need to be +1");
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

app.post("/pokemonRelease", isAuthenticated, async (req, res) => {
    const pokemonId: Number = Number(req.body.pokemon);
    if (req.session.currentUser) {
        req.session.currentUser.pokemons = req.session.currentUser.pokemons.filter(x => x.id != pokemonId);
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
        req.session.currentUser?.pokemons.push(pokemon);
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
    res.render("pokemonDetail", {
        currentUser: req.session.currentUser
    });
});

app.get("/mypokemon", isAuthenticated, async (req, res) => {
    const owned: boolean = req.query.owned == "true";
    const newCurrentPokemon: number | undefined = req.session.currentUser?.pokemons.findIndex(x => x.id == Number(req.query.newCurrentPokemon));
    if(newCurrentPokemon !== undefined && newCurrentPokemon != -1 && req.session.currentUser) {
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
                errorMessage: "An error occurred during session save."
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
            console.log("user not found")
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