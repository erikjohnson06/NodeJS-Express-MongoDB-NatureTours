const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        default: ""
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
        required: [true, 'Cover image required for tour']
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
    this.find({secretTour : { $ne: true }}); //Skip over any results are have secretTour set to true
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
        $match: { secretTour : { $ne : true }}
    });

    //console.log(this.pipeline);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
