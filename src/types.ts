export interface BondzioFood {
    // Name of the room, provided by client
    roomName: string,
    // Password, provided by the user
    password: string,
    // Action to be performed
    action: BondzioAction
}

export enum BondzioAction{
    Login = 0,
    Register = 1,
}


export interface Room {
    roomId: string,
    password: string,
    roomKey: string
}

export interface BondzioStatus extends Room {
    // Flag indicating whether the status is not being altered
    isValid: boolean
}

export interface Message {
    nickname: string,
    content: string
}

export interface DrawCoords {
    x: number,
    y: number
}

export interface BondzioSocketCallbacks {
    onConnect: (connectMessage: string) => void,
    onRoomConfirm: (confirmMessage: string) => void,
    onChatMessage: (chatMessage: string) => void,
    onDraw: (coords: DrawCoords) => void,
    onCorrectGuess: () => void,
    onOpponentGuess: (opponent: string) => void,
    onNewWord: (word: string) => void
}
