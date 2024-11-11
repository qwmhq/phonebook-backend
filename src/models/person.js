require('dotenv').config();
const mongoose = require('mongoose');

const mongo_url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(mongo_url)
	.then(() => console.log('connected to MongoDB'))
	.catch(err => console.log('error connecting to MongoDB:', err.message));

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: [true, 'name required']
	},
	number: {
		type: String,
		minLength: 8,
		validate: {
			validator: v => /^\d{2,3}-\d+$/.test(v),
			message: props => `${props.value} is not a valid phone number!`
		},
		required: [true, 'phone number required']
	}
});

personSchema.set('toJSON', {
	transform: (doc, returnedObj) => {
		returnedObj.id = doc._id.toString();
		delete returnedObj._id;
		delete returnedObj.__v;
	}
});

module.exports = mongoose.model('Person', personSchema);
