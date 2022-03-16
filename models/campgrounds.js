const mongoose = require('mongoose')

const cmpSchema = new mongoose.Schema({
	title: String,
	price: Number,
	desc: String,
	location: String,
	image: {
		type: String,
		default: 'https://source.unsplash.com/collection/483251/800x500'
	}
})

module.exports = mongoose.model('Campground', cmpSchema)