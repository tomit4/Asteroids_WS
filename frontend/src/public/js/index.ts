import config from './config.js'
// TODO: handle user ids on both front and back ends
// from user inputted url for now
const socket = new WebSocket(config.ws_main_addr as string)
const form: HTMLFormElement = document.getElementById(
    'msgForm',
) as HTMLFormElement

socket.addEventListener('open', event => {
    console.log('Websocket connection opened')
    // socket.send('Hello Server!')
})

// TODO: possibly render newMsg content with new <p> tags here
socket.onmessage = message => {
    console.log('Message from server :=>', message.data)
}

socket.addEventListener('close', () => {
    console.log('Websocket connection closed')
})

form.addEventListener('submit', event => {
    event.preventDefault()
    const message = document.getElementById('inputBox') as HTMLInputElement
    socket.send(message.value)
    const newMsg = document.getElementById('newMsg') as HTMLElement
    newMsg.textContent = message.value
    const inputBox = document.getElementById('inputBox') as HTMLElement
    inputBox.textContent = ''
})
