const Follow = require('../models/follow');
const User = require('../models/user');
const followService = require('../service/followService')
const mongoosePaginate = require('mongoose-pagination');

const save = (req, res) => {

    const params = req.body;
    const identity = req.user;

    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed,
    });
    
    userToFollow.save((error, followStorage) => {

        if(error || !followStorage){
            return res.status(404).send({
                status: "error",
                messague: "no se pudo segir a la persona"
            });
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStorage
        });
    })
    
}

const unFollow = (req, res) => {

    const userId = req.user.id;
    const followedId = req.params.id;

    Follow.find({
        "user": userId,
        "followed": followedId
    }).remove ((error, followDelete) => {

        if(error || !followDelete){
            return res.status(500).send({
                status: "error",
                messague: "no se pudo dejar de segir a la persona"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "usuario dejo de segir corractamente",
            identity: followDelete
        })
    });

}

const following = (req, res) =>{

    let userId = req.user.id;
    if(req.params.id) userId = req.params.id;

    let page = 1;
    if(req.params.page) page = req.params.page;

    const itemPerPage = 5;

    Follow.find({user: userId})
        .populate("user followed", "-password -role -__v")
        .paginate(page, itemPerPage, async (error, follows, total) => {

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "usuario segidos",
                identity: follows,
                total,
                page: Math.ceil(total/itemPerPage),
                follows,
                user_following: followUserIds.following,
                user_follower_me: followUserIds.followers
            })
    })

}

const followers = (req, res) =>{

    
    let userId = req.user.id;
    if(req.params.id) userId = req.params.id;

    let page = 1;
    if(req.params.page) page = req.params.page;

    const itemPerPage = 5;

    Follow.find({followed: userId})
        .populate("user", "-password -role -__v")
        .paginate(page, itemPerPage, async (error, follows, total) => {

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "usuario que me siguen",
                identity: follows,
                total,
                follows,
                page: Math.ceil(total/itemPerPage),
                user_following: followUserIds.following,
                user_follower_me: followUserIds.followers
            })
    })

}

module.exports={
    save,
    unFollow,
    following,
    followers
}