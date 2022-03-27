const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
	parentCamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Campground',
		required: true
	},
	review: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})

module.exports = mongoose.model('Review', reviewSchema)