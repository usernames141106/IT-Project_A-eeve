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
    // attack: number,
    // defence: number
}
export interface IUser  {
    _id?: ObjectId,
    name: string,
    passwordHash: string,
    pokemons:IPokemon[],
    currentPokemon?:number
}

