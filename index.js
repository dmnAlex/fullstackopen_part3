const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('content', (req, res) => (
    req.method === 'POST' ? JSON.stringify(req.body) : ''
))

const requestLogger = (req, res, next) => {
    console.log('RQ_Method:', req.method)
    console.log('RQ_Path:  ', req.path)
    console.log('RQ_Body:  ', req.body)
    console.log('---')
    next()
}

app.use(express.json())
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: '39-23-6423122',
    },
]

app.get('/info', (request, response) => {
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date}</p>
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const person = {... request.body}

    if (!(person.name && person.number)) {
        return response.status(400).json({ error: 'name or number is missing' })
    }
    if (persons.map(person => person.name).includes(person.name)) {
        return response.status(400).json({ error: 'name must be unique' })
    }

    person.id = Math.floor(Math.random() * 1000000000)
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})