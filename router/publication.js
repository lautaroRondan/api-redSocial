const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication');
const middleware = require('../middlewares/auth');

router.post("/save", middleware.auth, publicationController.save);
router.get("/detail/:id", middleware.auth, publicationController.detail);
router.delete("/remove/:id", middleware.auth, publicationController.remove);
router.get("/user/:id/:page?", middleware.auth, publicationController.user);
// router.post("/upload", [middleware.auth, uploads.single("file0")], publicationController.upload);
router.get("/feed/:page?", middleware.auth, publicationController.feed);
module.exports = router;