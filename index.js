require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/mongo')

morgan.token('content', (req) => (
    req.method === 'POST' ? JSON.stringify(req.body) : ''
))

// const requestLogger = (req, res, next) => {
//     console.log('RQ_Method:', req.method)
//     console.log('RQ_Path:  ', req.path)
//     console.log('RQ_Body:  ', req.body)
//     console.log('---')
//     next()
// }

app.use(express.static('build'))
app.use(express.json())
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())

app.get('/info', (request, response) => {
    Person.count((error, count) => {
        response.send(`
            <div>
                <p>Phonebook has info for ${count} people</p>
                <p>${new Date}</p>
            </div>
        `)
    })

})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    if (!(request.body.name && request.body.number)) {
        return response.status(400).json({ error: 'name or number is missing' })
    }

    const person = new Person({ ...request.body })

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformated id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})