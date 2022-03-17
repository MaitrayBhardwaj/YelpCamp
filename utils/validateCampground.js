const Joi = require('joi')
const expressError = require('./expressError')

const validateCampground = (req, res, next) => { 
	const campgroundSchema = Joi.object({
		title: Joi.string().max(30).min(2).required(),
		desc: Joi.string().max(200).min(10).required(),
		location: Joi.string().max(30).required(),
		price: Joi.number().min(0).required()
	})

	const { error } = campgroundSchema.validate(req.body)
	if(error){
		const message = error.details.map(ele => ele.message).join(', ')
		throw new expressError(message, 400)
	}
	next()
}

module.exports = validateCampground