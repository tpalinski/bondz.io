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
```

Return current state of Bondzio object:

```ts
function Bondzio.state(): BondzioStatus
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

### Collaborate

You can collaborate on this project by cloning the repository and running:  

```npm i```  

and  

```npm run dev```  

to run the package in development mode

#### Warning

The package utilizes fetch API, which requires node >= 18.0.0 to run
