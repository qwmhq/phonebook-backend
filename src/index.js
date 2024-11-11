const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

app.use(express.json());

morgan.token('request-body', (req) => {
	const body = JSON.stringify(req.body);
	return body !== '{}'
		? body
		: '';
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

app.use(express.static('dist'));


app.get('/api/persons', (request, response) => {
	Person.find({})
		.then(persons => {
			response.json(persons);
		});
});

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person);
			} else {
				response.statusMessage = 'Person with the given id not found';
				response.status(404).end();
			}
		})
		.catch(err => next(err));
});

app.delete('/api/persons/:id', (request, response) => {
	Person.findByIdAndDelete(request.params.id)
		.then(person => {
			if (person) {
				response.status(204).end();
			} else {
				response.status(404).end();
			}
		});
});

app.post('/api/persons', (request, response, next) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({ error: 'name or number missing from request body' });
	}

	const person = new Person({ name: body.name, number: body.number });
	person.save()
		.then(savedPerson => {
			response.status(201).json(savedPerson);
		})
		.catch(error => next(error));
});

app.put('/api/persons/:id', (request, response) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({ error: 'name or number missing from request body' });
	}

	const person = { name: body.name, number: body.number };

	Person.findByIdAndUpdate(
		request.params.id,
		person,
		{
			new: true,
			runValidators: true
		})
		.then(updatedPerson => {
			if (updatedPerson) {
				response.json(updatedPerson);
			} else {
				response.status(404).end();
			}
		});
});

app.get('/api/info', (request, response) => {
	Person.estimatedDocumentCount()
		.then(count => {
			response.send(`
<p>
	Phonebook has info for ${count} people </br>
	${Date()}
</p>
	`);
		});
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	} else if (error.name === 'ValidationError') {
		return response.status(400).send({ error: error.message });
	}

	next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
