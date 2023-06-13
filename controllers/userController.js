 //Image processing Libraries
const multer = require('multer');
const sharp = require('sharp');

const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//const multerStorage = multer.diskStorage({
//    destination: (request, file, callback) => {
//        callback(null, 'public/img/users');
//    },
//    filename: (request, file, callback) => {
//        const ext = file.mimetype.split('/')[1];
//        callback(null, `user-${request.user.id}-${Date.now()}.${ext}`);
//    }
//});

const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    } else {
        callback(new AppError('Please limit file uploads to images only', 400), false);
    }
};

const imageUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.resizeUserImage = (request, response, next) => {

    if (!request.file){
        return next();
    }

    request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

    sharp(request.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/users/${request.file.filename}`);

    next();
};
/**
 *
 * @param {type} obj
 * @param {type} allowedFields
 * @returns {Object}
 */
filterObject = (obj, ...allowedFields) => {

    let newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.uploadUserImage = imageUpload.single('photo');

exports.updateUserData = catchAsyncErrors(async (request, response, next) => {

    //Create error if user POSTs password data
    if (request.body.password || request.body.passwordConfirm) {
        return next(new AppError('Passwords not allowed in this route. Please use /updatePassword.', 400));
    }

    //Update user - only allow certain fields to be updated
    let filteredBody = filterObject(request.body, 'name', 'email');

    if (request.file) {
        filteredBody.image = request.file.filename;
    }

    const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {new : true, runValidators: true});

    response
            .status(200)
            .json({
                status: "success",
                data: {
                    user: user
                }
            });
});

exports.deleteCurrentUser = catchAsyncErrors(async (request, response, next) => {

    const user = await User.findByIdAndUpdate(
            request.user.id,
            {active: false}
    );

    response
            .status(204)
            .json({
                status: "success",
                data: null
            });
});

exports.getCurrentUser = (request, response, next) => {
    request.params.id = request.user.id;
    next();
};

exports.getAllUsers = factory.getAllDocuments(User);
exports.getUserById = factory.getDocument(User);
exports.updateUserById = factory.updateDocument(User);
exports.deleteUserById = factory.deleteDocument(User);