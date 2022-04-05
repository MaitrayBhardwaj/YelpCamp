const mongoose = require('mongoose')
const Review = require('./reviews')
const { cloudinary } = require('../cloudinary')

const imgSchema = new mongoose.Schema({
	url: {
		type: String,
		required: true
	},
	filename: {
		type: String,
		required: true
	}
})

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
	image: [ imgSchema ],
	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})

const delImgs = async (camp) => {
	for(let image of camp.image){
		await cloudinary.uploader.destroy(image.filename)
	}
}

cmpSchema.post('findOneAndDelete', async (data) => {
	console.log(data)
	await Promise.all([Review.deleteMany({_id: { $in: data.reviews } }), delImgs(data)])
})

module.exports = mongoose.model('Campground', cmpSchema)