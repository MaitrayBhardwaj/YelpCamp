const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campgrounds')

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

app.get('/campgrounds', (req, res) => {
	Campground.find({})
		.then(data => {
			res.render('allCamp', { data })
		})
})

app.get('/campgrounds/new', (req, res) => {
	res.render('addCamp')
})

app.get('/campgrounds/:id', (req, res) => {
	const id = req.params.id
	Campground.findById(id)
		.then(data => {
			res.render('campInfo', { data })
		})
		.catch(err => {
			console.log(err)
		})
})

app.get('/campgrounds/:id/edit', (req, res) => {
	const id = req.params.id
	Campground.findById(id)
		.then(data => {
			res.render('editCamp', { data })
		})
		.catch(err => {
			res.send(err)
		})
})

app.post('/campgrounds', (req, res) => {
	const newCamp = new Campground(req.body)
	newCamp.save()
		.then(data => {
			res.redirect(`/campgrounds/${newCamp._id}`)
		})
		.catch(err => {
			console.log(err)
		})
})

app.patch('/campgrounds/:id', (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
		.then(data => {
			res.redirect(`/campgrounds/${data._id}`)
		})
		.catch(err => {
			res.send(err)
		})
})

app.delete('/campgrounds/:id', (req, res) => {
	Campground.findByIdAndDelete(req.params.id)
		.then(() => {
			res.redirect('/campgrounds')
		})
		.catch(err => {
			res.send(err)
		})
})

app.listen(3000, () => {
	console.log('Connection active on Port 3000')
})