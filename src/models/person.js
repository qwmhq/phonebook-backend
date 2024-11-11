require('dotenv').config();
const mongoose = require('mongoose');

const mongo_url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(mongo_url)
	.then(() => console.log('connected to MongoDB'))
	.catch(err => console.log('error connecting to MongoDB:', err.message));

const personSchema = new mongoose.Schema({
	name: String,
	number: String
});

personSchema.set('toJSON', {
	transform: (doc, returnedObj) => {
		returnedObj.id = doc._id.toString();
		delete returnedObj._id;
		delete returnedObj.__v;
	}
});

module.exports = mongoose.model('Person', personSchema);
