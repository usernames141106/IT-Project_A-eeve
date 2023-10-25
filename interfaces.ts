export interface pokemon {
    id: number,
    name: string,
    types: string[],
    image: string,
    height: number,
    weight: number,
    maxHP: number,
};

export interface pokemonTypes {
    slot: number,
    type: pokemonType
};

export interface pokemonType {
    name: string,
    url: string;
};