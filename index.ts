import express from "express";
import { pokemon } from "./interfaces";
const app = express();

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

app.get("/home",(req,res)=>{
    res.render("home")
})

app.get("/pokemonBattle",(req,res)=>{
    res.render("pokemonBattle")
})

app.get("/whosthatpokemon",(req,res)=>{
    res.render("whosThatPokemon")
})

app.post("/pokemonCatch",(req,res)=>{
    const nickname: string | undefined = req.body.nickname;
    if(nickname == undefined) {
        res.render("pokemonCatch",{inBall: true, name: "eevee"});
    } else {
        res.render("pokemonCatch",{inBall: false, name: nickname});
    }
})

app.post("/pokemonCatch/useDefault",(req,res)=>{
    res.render("pokemonCatch",{inBall: false, name: "eevee"})
})

app.get("/pokemonCatch",(req,res)=>{
    res.render("pokemonCatch",{inBall: false, name: "eevee"})
})

app.get("/pokemondetail",(req,res)=> {
    res.render("pokemonDetail")
})

app.get("/mypokemon",(req,res)=> {
    res.render("myPokemon")
})

app.get("/pokemonvergelijken",(req,res)=> {
    res.render("pokemonvergelijken")
})

app.listen(app.get("port"),  () => {
    console.log(`Local url: http://localhost:${app.get("port")}`);
});