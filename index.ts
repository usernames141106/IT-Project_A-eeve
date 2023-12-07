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
        currentUser: req.session.currentUser
    });
});
app.post("/whosthatpokemon", isAuthenticated, async (req, res) => {
    // onderstaande is testcode
    // if (req.session.currentUser?.email) {
    //     let currentUser: IUser = req.session.currentUser;
    //     const { test } = req.body;
    //     currentUser.email = String(test);

    //     try {
    //         await UpdateUserInDB(currentUser)
    //     }
    //     catch(e) {
    //         console.error(e);
    //     }

    // }
});

app.post("/pokemonCatch", isAuthenticated, async (req, res) => {
    const nickname: string | undefined = req.body.nickname;
    const pokemonId: Number = Number(req.body.id);
    let pokemon: IPokemon | undefined = PokemonList.find(x => x.id == pokemonId);
    if(pokemon) {
        pokemon.name = nickname ? nickname : pokemon.name;
        !req.session.currentUser?.pokemons.push(pokemon); 
    }
    res.redirect("/mypokemon");
});

app.post("/pokemonCatch/useDefault", isAuthenticated, (req, res) => {
    res.render("pokemonCatch", {
        inBall: false,
        name: "eevee"
    });
});

app.get("/pokemonCatch", isAuthenticated, (req, res) => {
    const pokemonId: Number = Number(req.query.id);
    let pokemon: IPokemon | undefined = PokemonList.find(x => x.id == pokemonId);
    pokemon = pokemon ? pokemon : PokemonList[132];
    res.render("pokemonCatch", {
        inBall: false,
        Pokemon: pokemon,
        currentUser: req.session.currentUser
    });
});

app.get("/pokemondetail", isAuthenticated, (req, res) => {
    res.render("pokemonDetail", {
        currentUser: req.session.currentUser
    });
});

app.get("/mypokemon", isAuthenticated, (req, res) => {
    res.render("myPokemon", {
        currentUser: req.session.currentUser
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
    console.log(req.body.name1 +"  test"); 
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

app.listen(app.get("port"), async () => {
    await GetPokemonFromApi();
    console.log(`Local url: http://localhost:${app.get("port")}`);
});