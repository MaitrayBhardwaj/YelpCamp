const mongoose = require('mongoose')
const Campground = require('../models/campgrounds')
const cities = require('./cities')
const { descriptors: desc, places } = require('./seedsHelper')

mongoose.connect('mongodb://localhost:27017/YelpCamp')
	.then(res => {
		console.log('Connected to the database')
	})
	.catch(err => {
		console.log("Couldn't establish a connection to the database")
	});

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
	await Campground.deleteMany({})
	for(let i = 0; i < 20; i++){
		let random = Math.floor(Math.random() * 1000)
		Campground.insertMany([{
			title: `${randElem(desc)} ${randElem(places)}`,
			price: `${ Math.floor(Math.random() * 1000) + 100 }`,
			desc: `A ${randElem(desc)} ${randElem(desc)} ${randElem(desc)} Campground!`,
			location: `${ cities[random].city }, ${cities[random].state}`
		}])
			.then(data => {
				console.log(i)
			})
			.catch(err => {
				console.log(err)
			})
	}
}

seedDB()