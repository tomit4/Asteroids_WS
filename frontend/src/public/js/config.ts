type ConfigType = {
    ws_main_addr: string
}

const config: ConfigType = {
    // TODO: handle user ids on both front and back ends
    // from user inputted url for now
    ws_main_addr: 'ws://localhost:3000',
}

export default config
