import express from "express";

const app = express();

app.use(express.static("public"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("port", 3000);

app.get("/", (req, res) => {
    res.render("homeProject",{title: "Home"});
});

app.get("/home",(req,res)=>{
    res.render("home",{title: ""})
})

app.listen(app.get("port"),  () => {
    console.log(`Local url: http://localhost:${app.get("port")}`);
});