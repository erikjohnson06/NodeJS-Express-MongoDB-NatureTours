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

//Include compound index on the tour and user fields (1 = ASC, -1 = DESC)
reviewSchema.index(
        {tour: 1, user: 1},
        {unique: true}
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

//Update and Delete calls - retrieve current document from DB and store for use in the post middleware below
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.clone().findOne();
    next();
});

//Use query object to calculate ratings averages on update/delete document functions
reviewSchema.post(/^findOneAnd/, async function () {

    if (typeof (this.r.tour) !== "undefined") {
        this.r.constructor.calculateAverageRating(this.r.tour);
    }
});

reviewSchema.statics.calculateAverageRating = async function (tourId) {

    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        //Calculate new total and average for given tour
        {
            $group: {
                _id: '$tour',
                ratingsCount: {$sum: 1},
                averageRating: {$avg: '$rating'}
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].ratingsCount,
            ratingsAverage: stats[0].averageRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 1
        });
    }
};

//Re-calculate ratings average for tour when creating new review
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.tour);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

