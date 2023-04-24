# Bondzio

## An npm package for interfacing with Bondzio ecosystem

### Installation

To install bondz.io, run:
```npm i bondz.io```

To use it in your application:

```ts
import Bondzio from 'bondz.io'
```

### Usage

#### Methods

Top level element of the package, provides all the neccessary methods for interfacing with Bondzio system:

```ts  
class Bondzio
```

Delete room with ```roomId``` from the database:

```ts  
async function Bondzio.delete(roomId: string)
```

Check whether room with ```roomId``` exists in the database:

```ts  
async function Bondzio.check(roomId: string): Promise<boolean>
```

Perform operation specified by ```food``` and return ```Room```:

```ts
async function Bondzio.eat(food: BondzioFood): Promise<Room>   
throws {
    BondzioServerError,
    
}
```

Return current state of Bondzio object:

```ts
function Bondzio.state(): BondzioStatus
```

Return the nickname of currently connected player

```ts
function owner() : String
```

Connect to the websocket server as ```nickname```

```ts
function connect(nickname: string)
```

Setup custom callbacks to be execcuted on ws events

```ts
function socketSetup(callbacks: BondzioSocketCallbacks)
```

Send a chat message to the room

```ts
function sendMessage(message: string)
```

Send coordinates from drawing to the room

```ts
function sendDraw(coords: DrawCoords)
```

Send the player's guess

```ts
function guess(word: string)
```

Get a new clue to be guessed based on ```category```. Only to be called by the new drawing player

```ts
function getNewWord(category: string)
```

#### Types

```ts
interface Room {
    roomId: string,
    password: string,
    roomKey: string
}
```

An object containing information about the room bound to the Bondzio instance

```ts  
interface BondzioStatus {
    roomId: string,
    password: string,
    roomKey: string,
    isValid: boolean
}
```

An object containing information about the state of Bondzio instance with a ```isValid``` flag indicating whether there is currently an async operation altering the state of the instance

```ts  
interface BondzioFood {
    roomName: string,
    password: string,
    action: BondzioAction
}
```

An object containing parameters for ```Bondzio.food()``` method

```ts  
enum BondzioAction{
    Login = 0,
    Register = 1,
}
```

An enum representing complex actions that can be scheduled for Bondzio to perform

```ts  
interface BondzioSocketCallbacks {
    onConnect: (connectMessage: string) => void,
    onRoomConfirm: (confirmMessage: string) => void,
    onChatMessage: (chatMessage: Message) => void,
    onDraw: (coords: DrawData) => void,
    onCorrectGuess: () => void,
    onOpponentGuess: (opponent: string) => void,
    onNewWord: (word: string) => void
}
```  

An object used for assigning custom callbacks to be executed on websocket events

```ts  
interface DrawData {
    prevX: number,
    prevY: number,
    x: number,
    y: number,
    color: String,
    strokeSize: number
}
```  

An object representing information about drawing

#### Errors

```ts  
class BondzioServerNotFoundError extends Error {}
```

An error indicating that Bondzio could no establish connection to the server

```ts  
class BondzioWrongPasswordError extends Error {}
```

An error indicating that user submitted wrong password while logging in

```ts  
class BondzioRoomNotFoundError extends Error {}
```

An error indicating that user submitted wrong roomId while logging in

```ts  
class BondzioServerError extends Error {}
```

An error indicating that internal server error occured

```ts  
class BondzioRoomAlreadyExistsError extends Error {}
```

An error indicating that registered room already exists

```ts  
class BondzioSocketError extends Error {}
```

An error indicating that an internal callback error occured or no callback has been provided



### Collaborate

You can collaborate on this project by cloning the repository and running:  

```npm i```  

and  

```npm run dev```  

to run the package in development mode

#### Warning

The package utilizes fetch API, which requires node >= 18.0.0 to run
