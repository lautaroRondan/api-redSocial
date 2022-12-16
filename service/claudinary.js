const cloudinary = require("cloudinary");


cloudinary.config({ 
    cloud_name: 'diop3sm01', 
    api_key: '618994919792136', 
    api_secret: 'my-sjknRbxgXrZAYJO6xyql5kgo' 
  });


 async function uploadImage(filePath){
    return( await cloudinary.v2.uploader.upload(filePath,{
        folder: 'avatar'
    }))
    
}

async function uploadImageP(filePath){
    return( await cloudinary.v2.uploader.upload(filePath,{
        folder: 'publication'
    }))
    
}

module.exports = {uploadImage, uploadImageP}