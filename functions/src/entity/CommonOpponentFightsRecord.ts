import { Fight } from "./scheduledFight"
import { Nullable } from "./types"

export interface CommonOpponentFightsRecord {
    tableValue: Nullable<string[][]>,
    home: CommonOpponontFights,
    away: CommonOpponontFights,
}

export interface CommonOpponontFights {
    name: string
    win: number
    loss: number
    fights: Nullable<Fight[]>

}