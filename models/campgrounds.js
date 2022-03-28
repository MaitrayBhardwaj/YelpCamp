const mongoose = require('mongoose')
const Review = require('./reviews')

const cmpSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		maxLength: 30,
		minLength: 2
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	desc: {
		type: String,
		maxLength: 1000,
		minLength: 10,
		required: true
	},
	location: {
		type: String,
		required: true,
		maxLength: 30,
	},
	image: {
		type: String,
		default: 'https://source.unsplash.com/collection/483251/900x600'
	},
	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})

cmpSchema.post('findOneAndDelete', async (data) => {
	for(let review of data.reviews){
		await Review.findByIdAndDelete(review._id)
	}
})

module.exports = mongoose.model('Campground', cmpSchema)