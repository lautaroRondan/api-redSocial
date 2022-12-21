const mongoose = require('mongoose');

const connection = async() =>{

    try {
        await mongoose.connect("mongodb+srv://lautaro:lutyluty8@red-social.rrx767x.mongodb.net/red-social")
        console.log("conectado a la bd")
    } catch (error) {
        console.log(error);
        throw new Error("no se ha podido conectar a la base de datos");
    }
}
module.exports={
    connection
}