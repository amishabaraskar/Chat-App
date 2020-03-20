const users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room is required'
        }
    }

    const existinguser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existinguser) {
        return {
            error: 'Username already exists'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersinRoom = (room) => {
    usersinroom = users.filter((user) => user.room === room)
    return usersinroom
}

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersinRoom
}