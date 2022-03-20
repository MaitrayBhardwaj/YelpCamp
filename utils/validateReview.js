const Joi = require('joi')
const expressError = require('./expressError')

const validateReview = (req, res, next) => { 
	const reviewSchema = Joi.object({
		review: Joi.string().required(),
		rating: Joi.number().min(1).max(5).required()
	})

	const { error } = reviewSchema.validate(req.body)
	if(error){
		const message = error.details.map(ele => ele.message).join(', ')
		throw new expressError(message, 400)
	}
	next()
}

module.exports = validateReview