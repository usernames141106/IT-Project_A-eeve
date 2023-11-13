export interface Ipokemon{
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