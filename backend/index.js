//require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
const mongoose = require('mongoose')

const password = process.argv[2]
const url = `mongodb+srv://markdrummond:${password}@cluster0.amm6n.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`
//const url = process.env.MONGODB_URI;
mongoose.set('strictQuery',false)
mongoose.connect(url)
const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Note = mongoose.model('Note', noteSchema)


let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!, Mark</h1>')
})

// app.get('/api/notes', (request, response) => {
//     response.json(notes)
// })

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        console.log('x')
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server runningg on port ${PORT}`)
})