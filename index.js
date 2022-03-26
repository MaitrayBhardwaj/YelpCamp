require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const passportLocal = require('passport-local')

const Campground = require('./models/campgrounds')
const Review = require('./models/reviews')
const User = require('./models/users')

const wrapAsync = require('./utils/wrapAsync')
const expressError = require('./utils/expressError')
const validateCampground = require('./utils/validateCampground')
const validateReview = require('./utils/validateReview')
const validateUser = require('./utils/validateUser')

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
app.use(flash())
app.use(session({
	secret: process.env.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}))

app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
	res.locals.user = req.user
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	res.locals.warning = req.flash('warning')
	res.locals.info = req.flash('info')
	next()
})

const isLoggedIn = (req, res, next) => {
	if(!req.isAuthenticated()){
		req.session.returnTo = req.originalUrl
		req.flash('error', 'You must be logged in to access that!')
		return res.redirect('/login')
	}
	else{
		next()
	}
}

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res, next) => {
	res.send('Working!')
})

app.get('/campgrounds', wrapAsync(async (req, res, next) => {
	const data = await Campground.find({})
	res.render('allCamp', { data, pageTitle: 'All Campgrounds' })
}))

app.get('/campgrounds/new', (req, res, next) => {
	res.render('addCamp', { pageTitle: 'Add a Campground' })
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
		res.render('campInfo', { data, pageTitle: data.title })
	}
}))

app.get('/campgrounds/:id/edit', isLoggedIn, wrapAsync(async (req, res, next) => {
	const id = req.params.id
	const data = await Campground.findById(id)
	res.render('editCamp', { data, pageTitle: `Edit ${data.title}` })
}))

app.post('/campgrounds', isLoggedIn, validateCampground, wrapAsync(async (req, res, next) => {
	const newCamp = new Campground(req.body)
	await newCamp.save()
	req.flash('success', 'Campground added successfully!')
	res.redirect(`/campgrounds/${newCamp._id}`)
}))

app.post('/campgrounds/:id', isLoggedIn, validateReview, wrapAsync(async (req, res, next) => {
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
	res.render('campReviews', { reviews, pageTitle: `Reviews for ${reviews.title}` })
}))

app.patch('/campgrounds/:id', isLoggedIn, validateCampground, wrapAsync(async (req, res, next) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
	req.flash('success', 'Campground updated successfully!')
	res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', isLoggedIn, wrapAsync(async (req, res, next) => {
	await Campground.findByIdAndDelete(req.params.id)
	req.flash('success', 'Campground deleted successfully!')
	res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:campId/reviews/:id', isLoggedIn, wrapAsync(async (req, res, next) => {
	await Review.findByIdAndDelete(req.params.id)
	req.flash('success', 'Review deleted successfully!')
	res.redirect(`/campgrounds/${req.params.campId}`)
}))

app.get('/signup', (req, res) => {
	res.render('register', { pageTitle: 'Sign Up to YelpCamp'})
})

app.post('/signup', validateUser, wrapAsync(async (req, res, next) => {
	const { email, username, password } = req.body
	const user = new User({ email, username })
	try{
		const newUser = await User.register(user, password)
		req.login(newUser, err => {
			if(err) return next(err);
			req.flash('success', 'Successfully signed up on YelpCamp!')
			res.redirect('/campgrounds')
		})
	}
	catch(err){
		req.flash('error', err.message)
		res.redirect('/signup')
	}
}))

app.get('/login', (req, res) => {
	res.render('login', { pageTitle: 'Log In to YelpCamp' })
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), wrapAsync(async (req, res, next) => {
	const { username } = req.body
	const redirectTo = req.session.returnTo || '/campgrounds'
	delete req.session.returnTo
	req.flash('success', `Welcome back, ${username}! Logged in successfully.`)
	res.redirect(redirectTo)
}))

app.get('/logout', (req, res) => {
	req.logout()
	req.flash('success', 'Successfully logged out!')
	res.redirect('/campgrounds')
})

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