const {connection} = require('./database/connection');
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// inicializar app
console.log("proyecto arrancado");

// conectar a la base de datos
connection();

// crear servidor node
const app = express();
const puerto =  process.env.PORT ||3000;

// configurar cors
app.use(cors());

// convertir body a objeto js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}));

//llamar a routes
const user_routes = require("./routes/user.js");
const followRoutes = require('./routes/follow.js');
const publicationRoutes = require('./routes/publication');

app.use('/api/user', user_routes);
app.use('/api/follow', followRoutes);
app.use('/api/publication', publicationRoutes);

app.listen(puerto, ()=>{
    console.log("servidor corriendo en el puerto "+puerto);
});