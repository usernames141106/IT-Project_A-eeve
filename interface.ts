import { ObjectId } from "mongodb"

export interface IPokemon{
    id: number,
    name: string,
    image: string,
    height: number,
    weight: number,
    maxHP: number,
    attack:number,
    defence:number,
    currentHp?:number,
    wins:number,
    losses:number,
    captureDate?:Date
}
export interface IUser  {
    _id?: ObjectId,
    name: string,
    email: string,
    passwordHash: any,
    pokemons:IPokemon[],
    currentPokemon?:number
}

