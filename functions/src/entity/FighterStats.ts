import { myDictionary } from '../entity/myDictionary'

export interface FighterStats {
    name: string
    fightHistory: myDictionary
    asFavorite: FieldStat
    asUnderdog: FieldStat
    championshipFight: FieldStat
    undefeated: Undefeated
    lastKoBy: KoOrSubBY
    lastSubBy: KoOrSubBY
}

export interface FightRecord {
    win: FinishingMethodCount
    loss: FinishingMethodCount
    noCcontest: FinishingMethodCount
    totalFights: number
    bounseTimes: number
    missedWeightTimes: number
}

export interface FinishingMethodCount {
    tko: number
    sub: number
    dec: number
    total: number
}

export interface FieldStat {
    win: number
    loss: number
    total: number
}
type Nullable<T> = T | null;
export interface Undefeated {
    undefeatedCount: number
    lastdefeatedBy: Nullable<string>
    lastLossFinalRound: Nullable<number>
    lastLossDate: Nullable<string>
    lastLossFinishingMethod: Nullable<string>;
}
export interface KoOrSubBY {
    name: Nullable<string>
    date: Nullable<string>
    finalRound: Nullable<string>
}