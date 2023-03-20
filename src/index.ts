import { BondzioRoomNotFoundError, BondzioServerError, BondzioServerNotFoundError, BondzioWrongPasswordError } from "./error";
import { roomParser } from "./roomParser";

// Types

export interface BondzioFood {
    // Name of the room, provided by client
    roomName: string,
    // Password, provided by the user
    password: string,
    // Action to be performed
    action: MajorBondzioAction | MinorBondzioAction
}

export enum MajorBondzioAction{
    Login = 0,
    Register = 1,
}

export enum MinorBondzioAction{
    Delete = 2,
    Check = 3
}

export interface Room {
    roomId: string,
    password: string,
    roomKey: string
}
export default class Bondzio {

    private static SERVER_URL = "https://bondzioshed.bieda.it/";

    private roomId: string = ""
    private password: string = ""
    private roomKey: string =  ""

    constructor() {
        fetch(Bondzio.SERVER_URL)
            .then(res => {
                if(res.status != 200){
                    throw new BondzioServerNotFoundError("Error while creating Bondzio: no server connection could be established")
                }
            });
    }

    public async eat(food: BondzioFood): Promise<Room | null> {
        this.roomId = food.roomName
        this.password = food.password
        await this.login()
        return null;
    }

    private async login(): Promise<Room>{
       let res = await fetch(Bondzio.SERVER_URL + `login?id=${this.roomId}&password=${this.password}`, {
            method: 'POST'
        })
        if(res.status === 200){
            let body = await res.json();
            let room = roomParser(body)
            if(room != null){
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

}

let bondzio = new Bondzio()

bondzio.eat({
    roomName: 'tymektest',
    password: '1234',
    action: MajorBondzioAction.Login
})


