import config from './config.js'
let socket = new WebSocket(config.ws_main_addr as string)
const form: HTMLFormElement = document.getElementById(
    'msgForm',
) as HTMLFormElement
const chat = document.getElementById('chat') as HTMLDivElement
const message = document.getElementById('inputBox') as HTMLInputElement
const inputBox = document.getElementById('inputBox') as HTMLElement

let clientId: string = ''

socket.addEventListener('open', () => {
    console.log('Websocket connection opened')
})

socket.onmessage = message => {
    const data = JSON.parse(message.data)
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id
    } else {
        const message = document.createElement('p')
        message.textContent = `${data.id}: ${data.message}`
        chat.appendChild(message)
    }
}

socket.addEventListener('close', () => {
    console.log('Websocket connection closed')
})

form.addEventListener('submit', event => {
    event.preventDefault()
    socket.send(message.value)
    inputBox.textContent = ''
})
