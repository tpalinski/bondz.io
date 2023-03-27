import { BondzioRoomAlreadyExistsError, BondzioRoomNotFoundError, BondzioServerError, BondzioServerNotFoundError, BondzioWrongPasswordError } from "./error";
import { roomParser } from "./roomParser";
import {io} from 'socket.io-client';

// Types

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

export default class Bondzio {

    private static SERVER_URL = "https://bondzioshed.bieda.it/";
    private static SOCKET_URL = "ws://localhost:3001";
    private status: BondzioStatus = {
        roomId: "",
        password: "",
        roomKey: "",
        isValid: true
    }

    private io; 
    private nickname: string = "";

    constructor() {
        this.io = io(Bondzio.SOCKET_URL);  
        console.log("Connecting to the ws server...")
        fetch(Bondzio.SERVER_URL)
            .then(res => {
                if(res.status != 200){
                    throw new BondzioServerNotFoundError("Error while creating Bondzio: no server connection could be established")
                }
            });
        this.socketSetup();
    }

    public async eat(food: BondzioFood): Promise<Room | null> {
        this.status.isValid = false;
        this.status.roomId = food.roomName
        this.status.password = food.password
        switch(food.action){
            case BondzioAction.Login:
                try {
                    var res = await this.login()
                    this.status.isValid = true 
                    return res 
                } catch(e){
                    throw e;
                }
                
            case BondzioAction.Register:
                try{
                    var res = await this.register()
                    this.status.isValid = true
                    return res
                } catch (e) {
                    throw e
                }

        }
        return null;
    }

    
    public get state() : BondzioStatus {
        return this.status
    }
    

    private async login(): Promise<Room>{
       let res = await fetch(Bondzio.SERVER_URL + `login?id=${this.status.roomId}&password=${this.status.password}`, {
            method: 'POST'
        })
        if(res.status === 200){
            let body = await res.json();
            let room = roomParser(body)
            if(room != null){
                this.status.roomKey = room.roomKey
                return room;
            } else {
                throw new BondzioServerError("Error while logging in: cant parse room")
            }
        } else if(res.status === 401) {
            throw new BondzioWrongPasswordError("Error while logging in: wrong password provided")
        } else if(res.status === 400){
            throw new BondzioRoomNotFoundError("Error while logging in: specified room does not exist")
        } else {
            throw new BondzioServerError("Error while logging in: i dont know how is that even possible")
        }
    }

    private async register(): Promise<Room>{
        let res = await fetch(Bondzio.SERVER_URL + `create?id=${this.status.roomId}&password=${this.status.password}`, {
            method: 'POST'
        })
        if(res.status === 201){
            let body = await res.json();
            let room = roomParser(body)
            if(room != null){
                this.status.roomKey = room.roomKey
                return room;
            } else {
                throw new BondzioServerError("Error while registering: cant parse room")
            }
        } else if(res.status === 409) {
            throw new BondzioRoomAlreadyExistsError("Error while registering: room already exists")
        } else if(res.status === 500){
            throw new BondzioServerError("Error while registering: internal server error")
        } else {
            throw new BondzioServerError("Error while registering: that should not be happening right now")
        }
    }

    public async delete() {
        this.status.isValid = false
        let res = await fetch(Bondzio.SERVER_URL + `delete?id=${this.status.roomId}`, {
            method: 'POST'
        })
        if(res.status === 200){
            this.status = {
                roomId: "",
                roomKey: "",
                password: "",
                isValid: true
            }
            return
        } else if (res.status === 500){
            throw new BondzioServerError("Error while deleting: server error")
        } else {
            throw new BondzioServerError("Error while deleting: this should never happen")
        }
    }

    public async check(roomId: string): Promise<boolean>{
        let res = await fetch(Bondzio.SERVER_URL + `room?id=${roomId}`, {
            method: 'GET'
        })
        if(res.status === 200){
            let body = await res.json()
            return body
        } else {
            throw new BondzioServerError("Error searching for room: this should never happen")
        }
    }

    public connect(nickname: string){
        this.nickname = nickname;
        this.io.emit("join-room", {
            room: this.state.roomKey,
            nickname: nickname
        })

    }

    // Websocket logic
    public socketSetup(){

        this.io.on("connected", (msg: string) => {
            console.log(msg);
        })

        this.io.on("room-confirm", (msg: string) => {
            console.log(msg)
        })

        this.io.on("receive-message", (msg: Message) => {
            console.log(`${msg.nickname} says: ${msg.content}`)
        })

        this.io.on("receive-draw", (msg) => {
            console.log(msg)
        })

        this.io.on("correct-guess", () => {
            console.log("Guessed correctly")
        })

        this.io.on("new-word", (word: string) => {
            console.log("Your word is: " + word)
        })

        this.io.on("opponent-guessed", (nickname: string) => {
            console.log(`Opponenet: ${nickname} guessed the word!`)
        })
    }

    public sendMessage(message: string){
        this.io.emit("send-message", {
            nickname: this.nickname,
            content: message
        })
    }

    public sendDraw(coords: DrawCoords) {
        this.io.emit("send-draw", coords)
    }

    public guess(word: string) {
        this.io.emit("guess", word)
    }

    public getNewWord(category: string){
        this.io.emit("generate-new-word", category);
    }
}

// Only for dev purposes
let bd = new Bondzio();
bd.eat({
    roomName: 'tymektest',
    password: '1234',
    action: BondzioAction.Login
}).then(room => {
        bd.connect("Bondzio to kotek");
        setTimeout(() => {
            bd.sendMessage("meow")
            bd.sendDraw({x: 100, y:100})
        }, 1000)
    })
