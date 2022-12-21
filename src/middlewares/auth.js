const jwt = require('jwt-simple');
const moment = require('moment');
const libjwt = require('../service/jwt');
const secret = libjwt.secret;


exports.auth = (req, res, next) => { 

    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autorizacion"
        });
    }

    let token = req.headers.authorization.replace(/["']+/g, '');
    

    try {
        let playload = jwt.decode(token, secret);

        if(playload.exp <= moment().unix()){
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
                error
            }); 
        }
        req.user = playload;
        
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        }); 
    }

    

    next();
}