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
    captureDate:Date | null
}
export interface IUser  {
    _id?: ObjectId,
    name: string,
    email: string,
    salt:string
    hash: string,
    pokemons:IPokemon[],
    currentPokemon?:number
}
