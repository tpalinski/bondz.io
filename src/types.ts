

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
