 const $messageForm = document.querySelector('#messageform')
 const $messageButton = $messageForm.querySelector('button')
 const $messageInput = $messageForm.querySelector('input')
 const $messageLocation = document.querySelector('#send-location')
 const $messages = document.querySelector('#messages')

 const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

 const messageTemplate = document.querySelector('#message-template').innerHTML
 const locationmessageTemplate = document.querySelector('#locationmessage-template').innerHTML
 const sidebarTemplate = document.querySelector('#sideBar-template').innerHTML

 const socket = io()
 socket.on('countUpdated', (count) => {
     console.log("count is updated", count)
 })

 const autoscroll = () => {
     const $newmessage = $messages.lastElementChild

     const newmessageStyles = getComputedStyle($newmessage)
     const newmessageMargin = parseInt(newmessageStyles.marginBottom)
     const newmessageHeight = $newmessage.offsetHeight + newmessageMargin

     const visibleHeight = $messages.offsetHeight

     const containerHeight = $messages.scrollHeight

     const scrollOffset = $messages.scrollTop + visibleHeight
     if (containerHeight - newmessageHeight <= scrollOffset) {
         $messages.scrollTop = $messages.scrollHeight
     }
 }

 socket.on('locationmessage', (msg) => {
     console.log("from locationmessage", msg)
     const html = Mustache.render(locationmessageTemplate, { username: msg.username, url: msg.url, createdAt: moment(msg.createdAt).format('h:mm a') })
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
 })
 socket.on("message", (msg) => {
     console.log("from message", msg)
     const html = Mustache.render(messageTemplate, {
         username: msg.username,
         message: msg.text,
         createdAt: moment(msg.createdAt).format('h:mm a')
     })
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
 })


 /* document.querySelector('#increment').addEventListener('click',()=>{
     console.log("Clicked")
     socket.emit('increment')
 }) */
 $messageForm.addEventListener('submit', (e) => {
     e.preventDefault()

     $messageButton.setAttribute('disabled', 'disabled')
     const msg = $messageInput.value
     socket.emit('sendMessage', msg, (error) => {
         $messageButton.removeAttribute('disabled')
         $messageInput.value = ''
         $messageInput.focus()
         if (error) {
             return console.log(error)
         }
         console.log('Message delivered!!')
     })
 })

 document.querySelector('#send-location').addEventListener('click', () => {
     $messageLocation.setAttribute('disabled', 'disabled')
     navigator.geolocation.getCurrentPosition((position) => {
         //console.log(position.coords.latitude)
         socket.emit('sendlocation', {
             latitude: position.coords.latitude,
             longitude: position.coords.longitude
         }, (message) => {
             $messageLocation.removeAttribute('disabled')
             console.log(message)
         })
     })
 })

 socket.emit('join', { username, room }, (error) => {
     if (error) {

         alert('Try again')
         location.href = '/'
     }
 })

 socket.on('roomData', ({ room, users }) => {
     console.log(users)
     const html = Mustache.render(sidebarTemplate, { users, room })
     document.querySelector('#sidebar').innerHTML = html
 })