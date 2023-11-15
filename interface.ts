export interface IPokemon{
    id: number,
    name: string,
    image: string,
    height: number,
    weight: number,
    maxHP: number,
    currentHp?:number,
    wins:number,
    losses:number,
    captureDate?:Date
}
export interface IUser  {
    name: string,
    passwordHash: string,
    pokemons:IPokemon[],
    currentPokemon:number
}