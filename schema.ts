import { Schema } from "mongoose";

export const pokemonSchema = new Schema({
    id: Number,
    name: String,
    image: String,
    height: Number,
    weight: Number,
    maxHP: Number,
    currentHp:Number,
    wins:Number,
    losses:Number,
    captureDate:Date
});