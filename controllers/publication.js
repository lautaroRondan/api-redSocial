const Publication = require('../models/publication');
const followService = require('../service/followService')

const save = (req, res) => {

    const params = req.body;

    if (!params.text) return res.status(400).send({ satus: "error", message: "debes enviar el texto de la informacion" });

    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    newPublication.save((error, publicationStored) => {

        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                messague: "error al subir la publicacion"
            });
        }

        return res.status(200).send({
            status: "success",
            publication: publicationStored
        });
    })
}

const detail = (req, res) => {

    const publicationId = req.params.id;

    Publication.findById(publicationId, (error, publicationStored) => {

        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                messague: "error al subir la publicacion"
            });
        }

        return res.status(200).send({
            status: "success",
            publication: publicationStored
        });
    })
}

const remove = (req, res) => {

    const publicationId = req.params.id;

    Publication.find({ "user": req.user.id, "_id": publicationId }).remove(error => {
        if (error) {
            return res.status(500).send({
                status: "error",
                messague: "error al eliminar la publicacion"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "se ha eliminado la publicacion"
        });
    })

}

const user = (req, res) => {

    const userId = req.params.id;
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 5;

    Publication.find({ user: userId })
        .sort("-crated_at")
        .populate("user", "-password -__v -role")
        .paginate(page, itemsPerPage, (error, publications, total) => {

            if (error || !publications) {
                return res.status(404).send({
                    status: "error",
                    messague: "no hay publicaciones"
                });
            }

            return res.status(200).send({
                status: "success",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publications,

            });
        })

}

const upload = (req, res) => {
    //subir imagen de publicacion
}

const feed = async (req, res) => {

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 5;
    try {
        const myFollow = await followService.followUserIds(req.user.id);

        Publication.find({ user: myFollow.following })
            .populate("user", "-password -role -__v")
            .sort("-crated_at")
            .paginate(page, itemsPerPage, (error, publications, total) => {

                if (error || !publications) {
                    return res.status(404).send({
                        status: "error",
                        messague: "no hay publicaciones"
                    });
                }

                return res.status(200).send({
                    status: "success",
                    message: "feed",
                    total,
                    page,
                    pages: Math.ceil(total / itemsPerPage),
                    myFollow: myFollow.following,
                    publications
                });
            });



    } catch (error) {

        return res.status(500).send({
            status: "error",
            messague: "no hay feed"
        });

    }


}

module.exports = {
    save,
    detail,
    remove,
    user,
    upload,
    feed
}