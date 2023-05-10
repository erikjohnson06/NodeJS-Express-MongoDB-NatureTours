const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Tour names are limited to 50 characters'],
        minlength: [1, 'Invalid tour name']
    },
    slug: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: "",
        trim: true,
        maxlength: [2000, 'Tour descriptions are limited to 2000 characters'],
        minlength: [1, 'Invalid tour description']
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration'],
        min: [1, 'Invalid tour duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a maximum group size'],
        min: [1, 'Invalid maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be one of the following: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 1,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price'],
        min: [0, 'Price cannot be below zero'],
    },
    priceDiscount: {
        type: Number,
        default: 0,
        min: [0, 'Price discount cannot be below zero'],

        //Custom validator
        validate: {
            validator: function (val) {
                return val <= this.price; //priceDiscount should always be lower than price
            },
            message: 'Discount price ({VALUE}) must be less than regular price'
        }
    },
    summary: {
        type: String,
        default: "",
        trim: true,
        maxlength: [250, 'Summary is limited to 250 characters']
    },
    imageCover: {
        type: String,
        required: [true, 'Cover image required for tour'],
        maxlength: [250, 'Covert image names are limited to 250 characters']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    //Options
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Add virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//Document Middleware: runs before "save()" and "create()" commands
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

//Document Middleware: runs after "save()" and "create()" commands
tourSchema.post('save', function (doc, next) {
    next();
});

//Query Middleware: runs before queries (any command that starts with "find"
tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}}); //Skip over any results are have secretTour set to true
    this.startTime = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log("Query took " + (Date.now - this.start) + " milliseconds.");
    next();
});

//Aggregration Middleware
tourSchema.pre('aggregate', function (next) {

    this.pipeline().unshift({
        $match: {secretTour: {$ne: true}}
    });

    //console.log(this.pipeline);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
