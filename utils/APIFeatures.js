
class APIFeatures {

    /**
     *
     * @param {Object} query
     * @param {Object} queryString
     * @returns {nm$_APIFeatures.APIFeatures}
     */
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * Filtering results
     *
     * @returns {nm$_APIFeatures.APIFeatures}
     */
    filter(){

       //Ex: duration[gte]=5&difficulty=easy&limit=10
        const queryObj = {...this.queryString}; //Creates clone of object
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        //Exclude certain paramters that do not belong in query object
        excludedFields.forEach(el => delete queryObj[el]);

        //Replace query operators with Mongoose/Mongo operators
        //Ex: duration[gte]=5 => { duration : { $gte : 5 }}
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/gi, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    /**
     * Sorting
     *
     * @returns {nm$_APIFeatures.APIFeatures}
     */
    sort(){

        //Ex: sort=price (ASC), sort=-price (DESC), sort=price,duration (Multiple criteria)
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' '); //Replace commas with spaces: 'price,duration' => 'price duration'
            this.query = this.query.sort(sortBy);
        }
        //Default sorting
        else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    /**
     * Field limiting (projecting)
     *
     * @returns {nm$_APIFeatures.APIFeatures}
     */
    selectFields(){

        //Ex: fields=duration,price,name
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        //Default: Exclude '__v' field
        else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    /**
     * Pagination and limiting
     *
     * @returns {nm$_APIFeatures.APIFeatures}
     */
    pagination(){

        //Ex: page=2&limit=10
        const page = (parseInt(this.queryString.page)) || 1;
        const limit = (parseInt(this.queryString.limit)) || 100; //Default to 100 results returned
        const skip = ((page - 1 ) * limit);

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;