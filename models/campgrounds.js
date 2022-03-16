const mongoose = require('mongoose')

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
		maxLength: 200,
		minLength: 10
	},
	location: {
		type: String,
		required: true,
		maxLength: 30,
	},
	image: {
		type: String,
		default: 'https://source.unsplash.com/collection/483251/800x500'
	}
})

module.exports = mongoose.model('Campground', cmpSchema)