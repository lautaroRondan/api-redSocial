const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/user');
const middleware = require('../middlewares/auth');


// const storage = multer.diskStorage({
//     destination: (req, file, cb)=>{
//         cb(null, "./upload/avatars")
//     },
//     filename: (req, file, cb) =>{
//         cb(null, "avatar-"+Date.now()+"-"+file.originalname );
//     }
// })

// const uploads = multer({storage});

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", middleware.auth, userController.profile);
router.get("/list/:page?", middleware.auth, userController.list);
router.get("/counters/:id", middleware.auth, userController.counters);
router.put("/update", middleware.auth, userController.update);
router.post("/upload",middleware.auth, userController.upload);

module.exports = router;