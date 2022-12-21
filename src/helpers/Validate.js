const validator = require("validator");

const validateRegister = (params) => {
    let name = !validator.isEmpty(params.name) &&
               validator.isLength(params.name, { min: 3, max: undefined }) &&
               validator.isAlpha(params.name, "es-ES");
    let surname = !validator.isEmpty(params.surname) &&
                  validator.isLength(params.surname, { min: 3, max: undefined }) &&
                  validator.isAlpha(params.surname, "es-ES");
    let nick = !validator.isEmpty(params.nick) &&
               validator.isLength(params.nick, { min: 2, max: undefined });
    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    let password = !validator.isEmpty(params.password);
    
    if (params.bio) {
        let bio = validator.isLength(params.bio, { min: undefined, max: 250 });

        if (!bio) {
            throw new Error("no se ha superado la validacion bio");
        } else {
            console.log("validacion superada");
        }
    }

    if (!name || !surname || !nick || !email || !password) {
        throw new Error("no se ha superado la validacion");
    } else {
        console.log("validacion superada");
    }
};

module.exports = validateRegister;
