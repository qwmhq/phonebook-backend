require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('request-body', (req) => {
    const body = JSON.stringify(req.body)
    return body !== '{}'
        ? body
        : ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => {
            res.json(persons)
        })
        .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            if (result) {
                res.status(204).end()
            } else {
                res.statusMessage = 'person not found'
                res.status(404).end()
            }
        })
        .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number,
    })

    newPerson.save()
        .then(savedPerson => {
            res.status(201).json(savedPerson)
        })
        .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(
        req.params.id,
        person,
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(err => next(err))
})

app.get('/info', (req, res, next) => {
    Person.count({})
        .then(count => {
            res.send(`<p>Phonebook has info for ${count} people<br/>
${Date().toString()}</p>`)
        })
        .catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
    console.log('reached unknown endpoint handler')
    res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(404).send({ error: 'malformatted id' })
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message })
    }
    next(err)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})