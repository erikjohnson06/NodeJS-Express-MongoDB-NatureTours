const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty'],
            trim: true,
            maxlength: [500, 'Reviews are limited to 500 characters']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        //Options
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

//Remove certain fields from user object when populating reference
reviewSchema.pre(/^find/, function (next) {

//    this.populate({
//        path: 'user',
//        select: 'name '
//    })
//        .populate({
//        path: 'tour',
//        select: 'name image'
//    });

    this.populate({
        path: 'user',
        select: 'name '
    });

    next();
});

reviewSchema.statics.calculateAverageRating = async function(tourId){

    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        //Calculate new total and average for given tour
        {
            $group: {
                _id : '$tour',
                ratingsCount: {$sum: 1},
                averageRating: {$avg: '$rating'}
            }
        }
    ]);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].ratingsCount,
        ratingsAverage: stats[0].averageRating
    });
};

//Re-calculate ratings average for tour when creating new review
reviewSchema.post('save', function(){
    this.constructor.calculateAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

