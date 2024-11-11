const mongoose = require('mongoose');

if (process.argv.length < 3) {
	console.error('usage: node mongo.js <password>');
	process.exit(1);
} else if (process.argv.length === 4) {
	console.error('usage: node mongo.js <password> <name> <phone number>');
	process.exit(1);
}

const password = process.argv[2];

const mongo_url =
	`mongodb+srv://myAtlasDBUser:${password}@myatlasclusteredu.aixaiiy.mongodb.net/phonebook?retryWrites=true&w=majority&appName=myAtlasClusterEDU`;

mongoose.set('strictQuery', false);

mongoose.connect(mongo_url)
	.then(() => {
		if (process.argv.length < 4) {
			printAllPersons();
		} else {
			const name = process.argv[3];
			const number = process.argv[4];
			addPerson(name, number);
		}
	})
	.catch(err => console.log('error conncecting to mongodb', err.message));

const personSchema = new mongoose.Schema({
	name: String,
	number: String
});

const Person = mongoose.model('Person', personSchema);

const printAllPersons = () => {
	Person.find({})
		.then(result => {
			console.log('phonebook:');
			result.forEach(person => console.log(`${person.name} ${person.number}`));
			mongoose.connection.close();
		});
};

const addPerson = (name, number) => {
	const person = new Person({ name, number });

	person
		.save()
		.then(() => {
			console.log(`added ${name} number ${number} to phonebook`);
			mongoose.connection.close();
		});
};
