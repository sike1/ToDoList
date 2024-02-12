const express = require("express");
const path = require("path");

const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const expressValidator = require("express-validator")

require("dotenv").config({ path: ".env" });
const router = require("./routes/indexRoutes");
const expressLayout = require("express-ejs-layouts");

const db = require("./config/db");
require("./models/Usuarios");
require("./models/Tareas");

db.sync()
  .then(() => console.log("DB Conectada"))
  .catch((error) => console.log(error));

// Crear la app
const app = express();

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }));

// Habilitar Cookie Parser
app.use(cookieParser());

//Habilitar express validator
app.use(expressValidator());

// Habilitar CSRF
app.use(csrf({ cookie: true }));

// Habilitar EJS
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
//archivos staticos
app.use(express.static("public"));

//Crear sesion
app.use(
  session({
    secret: process.env.SECRETO,
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
  })
);

//Agrega connect flash
app.use(flash());

//Middleware (usuario logeado, flash messages)
app.use((req, res, next) => {
  res.locals.usuario = { ...req.usuario } || null
  res.locals.mensajes = req.flash();
  next();
});


//Habilitar express validator
app.use(expressValidator());

//Routing
app.use("/", router());

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`El Servidor esta funcionando en el puerto ${port}`);
});
