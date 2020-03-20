const generateMessage = (username, message) => {
    return { username, text: message, createdAt: new Date().getTime() }
}
const generatelocationMessage = (username, url) => {
    return { username, url, createdAt: new Date().getTime() }
}
module.exports = { generateMessage, generatelocationMessage }