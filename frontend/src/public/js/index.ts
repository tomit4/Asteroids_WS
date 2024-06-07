import config from './config.js'
let socket = new WebSocket(config.ws_main_addr as string)
const form: HTMLFormElement = document.getElementById(
    'msgForm',
) as HTMLFormElement
const chat = document.getElementById('chat') as HTMLDivElement
const message = document.getElementById('inputBox') as HTMLInputElement

let clientId: string = ''

socket.addEventListener('open', () => {
    console.log('Websocket connection opened')
})

// NOTE: Technically this only really works with two clients currently
socket.onmessage = message => {
    const data = JSON.parse(message.data)
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id
    } else if (data.type === 'message') {
        const message = document.createElement('p')
        message.textContent = `${data.id}: ${data.message}`
        if (data.id === clientId) {
            const yourMsg = document.createElement('div')
            yourMsg.classList.add('yourMsg')
            yourMsg.appendChild(message)
            chat.appendChild(yourMsg)
        } else {
            const theirMsg = document.createElement('div')
            theirMsg.classList.add('theirMsg')
            theirMsg.appendChild(message)
            chat.appendChild(theirMsg)
        }
    }
}

socket.addEventListener('close', () => {
    console.log('Websocket connection closed')
})

form.addEventListener('submit', event => {
    event.preventDefault()
    socket.send(message.value)
    form.reset()
})
