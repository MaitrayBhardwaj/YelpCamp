const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campgrounds')
const wrapAsync = require('./utils/wrapAsync')
const expressError = require('./utils/expressError')
const validateCampground = require('./utils/validateCampground')

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

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.send('Working!')
})

app.get('/campgrounds', wrapAsync(async (req, res) => {
	const data = await Campground.find({})
	res.render('allCamp', { data })
}))

app.get('/campgrounds/new', (req, res) => {
	res.render('addCamp')
})

app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
	const id = req.params.id
	const data = await Campground.findById(id)
	res.render('campInfo', { data })
}))

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
	const id = req.params.id
	const data = await Campground.findById(id)
	res.render('editCamp', { data })
}))

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res) => {
	const newCamp = new Campground(req.body)
	await newCamp.save()
	res.redirect(`/campgrounds/${newCamp._id}`)
}))

app.patch('/campgrounds/:id', validateCampground, wrapAsync(async (req, res) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
	res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id)
	res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
	next(new expressError('Not found', 404))
})

app.use((err, req, res, next) => {
	res.status(err.status)
	res.render('error', { err })
})

app.listen(3000, () => {
	console.log('Connection active on Port 3000')
})