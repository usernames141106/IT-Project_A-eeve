import express from 'express';
import session from 'express-session';
//import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
import { IPokemon, IUser } from './interface';
import { GetPokemonFromApi, PokemonList } from './db';

const app = express();

/* poging setup cookies
// MongoDB connection setup
const mongoUrl = 'mongodb+srv://itProject:f5pajH6wH8eHzpI5@cluster0.jnpguhk.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'itProject';

const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
    console.log('Connected to MongoDB');
});

// Express app setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'pajH6wH8eHzp',
    resave: false,
    saveUninitialized: true,
}));

// Route for registration
app.post('/register', async (req, res) => {
    const { name, password } = req.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const user: IUser = {
        name,
        passwordHash,
        pokemons: [],
    };
    
    const usersCollection = client.db(dbName).collection<IUser>('users');

    try {
        const result = await usersCollection.insertOne(user);
        console.log('User successfully registered:', result.insertedId);
        res.redirect('/login');
    } catch (error) {
        console.error('Registration failed:', error);
        res.redirect('/register'); // Handle registration failure
    }
});

// Route for login
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    const usersCollection = client.db(dbName).collection<IUser>('users');
    const user = await usersCollection.findOne({ name });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
        req.session.userId = user._id;
        console.log('Successfully logged in');
        res.redirect('/dashboard');
    } else {
        console.log('Login failed');
        res.redirect('/login');
    }
});

// Route for dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.userId) {
        res.send('Welcome to your dashboard');
    } else {
        res.redirect('/login');
    }
});
*/

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
    res.render("home")
});

app.get("/pokemonBattle", (req, res) => {
    res.render("pokemonBattle")
});

app.get("/whosthatpokemon", (req, res) => {
    res.render("whosThatPokemon" , {PokemonList: PokemonList})
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
    res.render("pokemonCatch", { inBall: false, name: "eevee" })
});

app.get("/pokemonCatch", (req, res) => {
    res.render("pokemonCatch", { inBall: false, name: "eevee" , PokemonList : PokemonList})
});

app.get("/pokemondetail", (req, res) => {
    res.render("pokemonDetail")
});

app.get("/mypokemon", (req, res) => {
    res.render("myPokemon")
});

app.get("/pokemonvergelijken", (req, res) => {
    res.render("pokemonvergelijken")
});

app.listen(app.get("port"), async () => {
    await GetPokemonFromApi();
    console.log(`Local url: http://localhost:${app.get("port")}`);
});