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
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/pokemonBattle", (req, res) => {
    res.render("pokemonBattle", { PokemonList: PokemonList });
});

app.get("/whosthatpokemon", (req, res) => {
    res.render("whosThatPokemon", { PokemonList: PokemonList });
});
app.post("/whosthatpokemon", async (req, res) => {
    if (req.session.currentUser?.email) {
        let currentUser: IUser = req.session.currentUser;
        const { test } = req.body;
        currentUser.email = String(test);

        try {
            await UpdateUserInDB(currentUser)
        }
        catch(e) {
            console.error(e);
        }
        
    }
});

app.post("/pokemonCatch", (req, res) => {
    const nickname: string | undefined = req.body.nickname;
    if (nickname == undefined) {
        res.render("pokemonCatch", { inBall: true, name: "eevee" });
    } else {
        res.render("pokemonCatch", { inBall: false, name: nickname });
    }
});

app.post("/pokemonCatch/useDefault", (req, res) => {
    res.render("pokemonCatch", { inBall: false, name: "eevee" });
});

app.get("/pokemonCatch", (req, res) => {
    res.render("pokemonCatch", { inBall: false, name: "eevee", PokemonList: PokemonList });
});

app.get("/pokemondetail", (req, res) => {
    res.render("pokemonDetail");
});

app.get("/mypokemon", (req, res) => {
    res.render("myPokemon");
});

app.get("/pokemonvergelijken", (req, res) => {
    res.render("pokemonvergelijken");
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

app.listen(app.get("port"), async () => {
    await GetPokemonFromApi();
    console.log(`Local url: http://localhost:${app.get("port")}`);
});