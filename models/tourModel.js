const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price']
    },
    priceDiscount: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        default: "",
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
