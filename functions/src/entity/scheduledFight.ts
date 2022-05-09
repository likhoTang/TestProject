export interface ScheduledFight {
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
        bettingOdds: string
        underdog: boolean
        favorite: boolean
        titleStatus: string
    },
    away: {
        name: string
        bettingOdds: string
        underdog: boolean
        favorite: boolean
        titleStatus: string
    },
    result: {
        home: string
        away: string
        finishingMethod: string
    },
}