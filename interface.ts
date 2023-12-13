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

/////////////////////////////////////////////////// poging evoluties
export interface IPokemonSpeciesResponse{
  evolution_chain : any;
}

export interface IEvolutionChain {
  is_baby: boolean;
  species: {
    name: string;
    url: string;
  };
  evolution_details: IEvolutionDetails[] | null;
  evolves_to: IEvolutionChain[];
}

export interface IEvolutionDetails {
  item: null;
  trigger: IEvolutionTrigger;
  gender: null;
  held_item: null;
  known_move: null;
  known_move_type: null;
  location: null;
  min_level: number;
  min_happiness: null;
  min_beauty: null;
  min_affection: null;
  needs_overworld_rain: boolean;
  party_species: null;
  party_type: null;
  relative_physical_stats: null;
  time_of_day: string;
  trade_species: null;
  turn_upside_down: boolean;
}

interface ITrigger {
  name: string;
  url: string;
}
export interface IEvolutionTrigger {
  name: string;
  url: string;
}
export interface IPokemonSpeciesResponse {
  id: number;
  baby_trigger_item: null;
  chain: IEvolutionChain;
}

