const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication')
const jwt = require('../service/jwt');
const bcrypt = require('bcrypt');
const fs = require('fs');
const mongoosePagination = require('mongoose-pagination');
const followService = require('../service/followService')
const cloudinary = require('../service/claudinary')
const validateRegister = require('../src/helpers/Validate');


const register = (req, res) => {

    let params = req.body;

    try {
        validateRegister(params)
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion no superada"
        })
    }
    

    //verificar si existe el usuario
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            })
        }
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "el usuario ya existe"
            })
        }

        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        let userToSave = new User(params)

        userToSave.save((error, userStored) => {
            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    messague: "error al guardar el usuario"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Se ha registrado el usuario",
                userStored
            })
        })
    })
}

const login = (req, res) => {

    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(500).send({
            status: "error",
            messague: "faltan completar algunos datos"
        });
    }

    User.findOne({ email: params.email })
        // .select({"password":0})
        .exec((error, user) => {
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    messague: "no existe el usuario"
                });
            }

            let pwd = bcrypt.compareSync(params.password, user.password);
            if (!pwd) {
                return res.status(404).send({
                    status: "error",
                    messague: "no te has identificado corractamente"
                });
            }

            const token = jwt.createTokens(user)

            return res.status(200).json({
                status: "success",
                message: "Accion de login",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            })

        })
}

const profile = (req, res) => {

    const id = req.params.id;

    User.findById(id)
        .select({ password: 0, role: 0 })
        .exec(async (error, userProfile) => {

            if (error || !userProfile) {
                return res.status(404).send({
                    status: "error",
                    messague: "el usuario no existe, o hay un error"
                });
            }

            const followInfo = await followService.followThisUser(req.user.id, id)

            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            });

        });

}

const list = (req, res) => {

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    let itemsPerPage = 5;

    User.find().select("-password -email -role -__v").sort('_id').paginate(page, itemsPerPage, async (error, users, total) => {

        if (error || !users) {
            return res.status(404).send({
                status: "error",
                messague: "error en la consulta"
            });
        }

        let followUserIds = await followService.followUserIds(req.user.id);


        return res.status(200).send({
            status: "succes",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follower_me: followUserIds.followers
        });
    })
}

const update = (req, res) => {

    let userIdentity = req.user;
    let userToUpdate = req.body;

    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;

    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            })
        }

        let userIsst = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsst = true;
        });

        if (userIsst) {
            return res.status(200).send({
                status: "success",
                message: "el usuario ya existe"
            })
        }

        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }

        User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true }, (error, userUpdate) => {

            if (error || !userUpdate) {
                return res.status(404).send({
                    status: "error",
                    messague: "error en la actualizacion del usuario"
                });
            }

            return res.status(200).send({
                status: "success",
                message: "se ha actualizado el usuario",
                user: userUpdate
            });
        })

    });

}

const upload = async (req, res) => {
    let userIdentity = req.user;
    if (req.files?.image) {

        const result = await cloudinary.uploadImage(req.files.image.tempFilePath);
        
        User.findOneAndUpdate({ "_id": userIdentity.id }, { image: result.url }, { new: true }, (error, userUpdate) => {

            if (error || !userUpdate) {
                return res.status(404).send({
                    status: "error",
                    messague: "error a la hora de subir la imagen"
                });
            }

            return res.status(200).send({
                status: "success",
                user: userUpdate
            });
        })
    }
}

const counters = async (req, res) => {

    let userId = req.user.id;
    if (req.params.id) {
        userId = req.params.id
    }

    try {
        const following = await Follow.count({ "user": userId });
        const followed = await Follow.count({ "followed": userId });
        const publications = await Publication.count({ "user": userId });

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            messague: "error en el contador",
            error
        });
    }
}

module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    counters
}