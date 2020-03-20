const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generatelocationMessage } = require('./utils/message')
const { addUser, getUser, removeUser, getUsersinRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    console.log('New WebSocket connection')


    /* let count=0
    socket.emit('countUpdated',count)
    socket.on('increment',()=>{
        count=count+1
        console.log("hello")
        io.emit('countUpdated',count)
    }) */
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(options.room)
        socket.emit("message", generateMessage('Admin', 'Welcome!!'))
        socket.broadcast.to(user.room).emit("message", generateMessage('Admin', `${user.username} has joined!!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback()
    })
    socket.on('sendlocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage', generatelocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
            //io.emit('location', `https://google.com/maps?q=${position.latitude},${position.longitude}`)
        callback('Location shared!!')
    })
    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})