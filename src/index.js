const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());

morgan.token('request-body', (req) => {
	const body = JSON.stringify(req.body)
	return body !== '{}'
		? body
		: ''
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));
app.use(express.static('dist'));

let persons = [
	{
		"id": "1",
		"name": "Arto Hellas",
		"number": "040-123456"
	},
	{
		"id": "2",
		"name": "Ada Lovelace",
		"number": "39-44-5323523"
	},
	{
		"id": "3",
		"name": "Dan Abramov",
		"number": "12-43-234345"
	},
	{
		"id": "4",
		"name": "Mary Poppendieck",
		"number": "39-23-6423122"
	}
];

app.get('/api/persons', (request, response) => {
	response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
	const person = persons.find(p => p.id === request.params.id);
	if (person) {
		response.json(persons.find(p => p.id === request.params.id));
	} else {
		response.statusMessage = "Person with the given id not found";
		response.status(404).end();
	}
});

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	const person = persons.find(p => p.id === id);
	if (person) {
		persons = persons.filter(p => p.id !== id);
		response.status(204).end();
	} else {
		response.status(404).end();
	}
});

app.post('/api/persons', (request, response) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({ error: "name or number missing from request body" });
	}
	if (persons.find(p => p.name === body.name)) {
		return response.status(400).json({ error: "name must be unique" });
	}

	const id = Math.floor(Math.random() * 999);
	const person = { id: `${id}`, name: body.name, number: body.number };
	persons.push(person);

	response.status(201).json(person);
});

app.get('/api/info', (request, response) => {
	response.send(`
<p>
	Phonebook has info for ${persons.length} people </br>
	${Date()}
</p>
	`);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
