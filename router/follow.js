const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow');
const middleware = require('../middlewares/auth');

router.post("/save", middleware.auth, followController.save);
router.delete("/unfollow/:id", middleware.auth, followController.unFollow);
router.get("/following/:id", middleware.auth, followController.following);
router.get("/following/:id?/:page?", middleware.auth, followController.following);
router.get("/followers/:id?/:page?", middleware.auth, followController.followers);

module.exports=router