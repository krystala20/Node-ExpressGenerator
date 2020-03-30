//router to handle upload endpoint:

const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //saving img to this folder
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        //ensure filename on server is same as filename on client side
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    //checks extension of file 
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //multer adds an object to the request object named file. file obj has add. info on file.
    //send info on file back to client. confirms to client that file was received
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;