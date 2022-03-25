const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const Campground = require('./models/campgrounds')
const Review = require('./models/reviews')

const wrapAsync = require('./utils/wrapAsync')
const expressError = require('./utils/expressError')
const validateCampground = require('./utils/validateCampground')
const validateReview = require('./utils/validateReview')

mongoose.connect('mongodb://localhost:27017/YelpCamp')
	.then(res => {
		console.log('Connected to the database')
	})
	.catch(err => {
		console.log("Couldn't establish a connection to the database")
	});

const app = express()

app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: "chembiostry",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}))
app.use(flash())
app.use((req, res, next) => {
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	res.locals.warning = req.flash('warning')
	res.locals.info = req.flash('info')
	next()
})

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.get('/', (req, res, next) => {
	res.send('Working!')
})

app.get('/campgrounds', wrapAsync(async (req, res, next) => {
	const data = await Campground.find({})
	res.render('allCamp', { data })
}))

app.get('/campgrounds/new', (req, res, next) => {
	res.render('addCamp')
})

app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
	const id = req.params.id
	const data = await Campground.findById(id).populate({
		path: 'reviews',
		options: { limit: 5 }
	})
	if(!data){
		req.flash('error', "Couldn't find the campground you are looking for :(")
		res.redirect('/campgrounds')
	}
	else{
		res.render('campInfo', { data })
	}
}))

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res, next) => {
	const id = req.params.id
	const data = await Campground.findById(id)
	res.render('editCamp', { data })
}))

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res, next) => {
	const newCamp = new Campground(req.body)
	await newCamp.save()
	req.flash('success', 'Campground added successfully!')
	res.redirect(`/campgrounds/${newCamp._id}`)
}))

app.post('/campgrounds/:id', validateReview, wrapAsync(async (req, res, next) => {
	const newReview = new Review(req.body)
	const campground = await Campground.findById(req.params.id)
	newReview.parentCamp = campground
	await newReview.save()
	campground.reviews.push(newReview)
	await campground.save()
	req.flash('success', 'Review added successfully!')
	res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id/reviews', wrapAsync(async (req, res, next) => {
	const { reviews } = await Campground.findById(req.params.id).populate('reviews')
	console.dir(reviews)
	res.render('campReviews', { reviews })
}))

app.patch('/campgrounds/:id', validateCampground, wrapAsync(async (req, res, next) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
	req.flash('success', 'Campground updated successfully!')
	res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', wrapAsync(async (req, res, next) => {
	await Campground.findByIdAndDelete(req.params.id)
	req.flash('success', 'Campground deleted successfully!')
	res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:campId/reviews/:id', wrapAsync(async (req, res, next) => {
	await Review.findByIdAndDelete(req.params.id)
	req.flash('success', 'Review deleted successfully!')
	res.redirect(`/campgrounds/${req.params.campId}`)
}))

app.all('*', (req, res, next) => {
	next(new expressError('Not found', 404))
})

app.use((err, req, res, next) => {
	const status = err.status || 500
	res.status(status)
	res.render('error', { err })
})

app.listen(3000, () => {
	console.log('Connection active on Port 3000')
})