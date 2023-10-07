import express from "express";

const app = express();

app.use(express.static("public"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
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
    res.render("pokemonbattle")
})

app.get("/whosthatpokemon",(req,res)=>{
    res.render("whosthatpokemon")
})

app.get("/pokemonCatch",(req,res)=>{
    res.render("pokemonCatch")
})

app.get("/pokemondetail",(req,res)=> {
    res.render("pokemonDetail")
})

app.listen(app.get("port"),  () => {
    console.log(`Local url: http://localhost:${app.get("port")}`);
});