import { Nullable } from "./types"

export interface Fight {
    id: string
    eventName: string
    eventSubname: string
    tournament: string
    date: string
    status: string
    titleFight: string
    ischampionshipFight: boolean
    weightClass: string
    home: {
        name: string
        bettingOdds: Nullable<string>
        underdog: boolean
        favorite: boolean
        titleStatus: Nullable<string>
    },
    away: {
        name: string
        bettingOdds: Nullable<string>
        underdog: boolean
        favorite: boolean
        titleStatus: Nullable<string>
    },
    result: {
        home: Nullable<string>
        away: Nullable<string>
        finishingMethod: Nullable<string>
    },
}