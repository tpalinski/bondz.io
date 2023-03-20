import { Room } from ".";

export const roomParser = (responseBody: Object): Room | null => {
    if(responseBody.hasOwnProperty("room")){
        //@ts-expect-error
        let roomObj = responseBody.room;
        if(roomObj.hasOwnProperty("roomPassword") &&
            roomObj.hasOwnProperty("roomID") &&
            roomObj.hasOwnProperty("roomKey")){
                return {
                    roomId: roomObj.roomID,
                    roomKey: roomObj.roomKey,
                    password: roomObj.password
                }
        }
        return null;
    } else {
        return null;
    }
}