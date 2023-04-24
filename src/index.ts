import { BondzioRoomAlreadyExistsError, BondzioRoomNotFoundError, BondzioServerError, BondzioServerNotFoundError, BondzioWrongPasswordError } from "./error";
import { roomParser } from "./roomParser";
import {io} from 'socket.io-client';
import {BondzioFood, BondzioStatus, DrawCoords, BondzioAction, Room, Message, BondzioSocketCallbacks } from './types'
import { BondzioSocketCallbackError } from "./error";
// Types


export default class Bondzio {

    private static SERVER_URL = "https://bondzioshed.bieda.it/";
    private static SOCKET_URL = "https://bondziodraw.bieda.it";
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
    }

    
    public get state() : BondzioStatus {
        return this.status
    }

    public get owner() : String {
        return this.nickname
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
    public socketSetup(callbacks: BondzioSocketCallbacks = {
        onDraw: (arg) => console.log(arg),
        onConnect: (arg) => console.log(arg),
        onNewWord: (arg) => console.log(arg),
        onChatMessage: (arg) => console.log(arg), 
        onRoomConfirm: (arg) => console.log(arg),
        onCorrectGuess: () => console.log("Guessed correctly"),
        onOpponentGuess:(arg) => console.log(arg)
    }){
        try{
            this.io.on("connected", (msg: string) => {
                callbacks.onConnect(msg)
            })

            this.io.on("room-confirm", (msg: string) => {
                callbacks.onRoomConfirm(msg)
            })

            this.io.on("receive-message", (msg: Message) => {
                callbacks.onChatMessage(msg)
            })

            this.io.on("receive-draw", (msg: DrawCoords) => {
                callbacks.onDraw(msg)
            })

            this.io.on("correct-guess", () => {
                callbacks.onCorrectGuess()
            })

            this.io.on("new-word", (word: string) => {
                callbacks.onNewWord(word)
            })

            this.io.on("opponent-guessed", (nickname: string) => {
                callbacks.onOpponentGuess(nickname)
            })
        } catch (e) {
            console.error(e)
            throw new BondzioSocketCallbackError("Error while processing websocket requests")
        }
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

