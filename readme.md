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

```ts  
class Bondzio
```

It is a top level element of the package, provides all the neccessary methods for interfacing with Bondzio system

```ts  
async Bondzio.delete(roomId: string)
```

Delete room with ```roomId``` from the database

```ts  
async Bondzio.check(roomId: string)
```

Check whether room with ```roomId``` exists in the database

```ts
async Bondzio.eat(food: BondzioFood)   
```

Perform operation specified by ```food``` and return ```Room```

```ts
Bondzio.status
```

Returns current state of Bondzio object

#### Types

```ts
export interface Room {
    roomId: string,
    password: string,
    roomKey: string
}
```

An object containing information about the room bound to the Bondzio instance
