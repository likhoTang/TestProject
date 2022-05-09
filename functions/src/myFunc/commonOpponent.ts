import { Fight } from "../entity/scheduledFight";
import { CommonOpponentFightsRecord, CommonOpponontFights } from "../entity/CommonOpponentFightsRecord"
import { checkFavorite, checkUnderdog, getFighterName, RESULT_LOSS, RESULT_NO_CONTEST, RESULT_WIN } from "./myFunc"
import { Nullable } from "../entity/types";

export function getCommonOpponentRecords(rawData1: any, rawData2: any): CommonOpponentFightsRecord {

    var commonOppNames = getCommonOpponentNames(rawData1, rawData2)
    var homeCommonOpponent = getCommonOpponentRecord(rawData1, commonOppNames)
    var awayCommonOpponont = getCommonOpponentRecord(rawData2, commonOppNames)
    var commonOpponentFightstable = getCommonOpponentTable(homeCommonOpponent, awayCommonOpponont, commonOppNames)

    var commonOpponentFightsRecord = {
        tableValue: commonOpponentFightstable,
        home: homeCommonOpponent,
        away: awayCommonOpponont,
    }

    return commonOpponentFightsRecord

}

function getCommonOpponentNames(rawData1: any, rawData2: any): string[] {
    var fighter1_opponent_names: string[] = rawData1.included.map((element: any) => (element.attributes.opponent_fighter_name));
    var fighter2_opponent_names: string[] = rawData2.included.map((element: any) => (element.attributes.opponent_fighter_name));

    const common_opponent_names: string[] = getArraysIntersection(fighter1_opponent_names, fighter2_opponent_names)
    return common_opponent_names
}
function getArraysIntersection(a1: string[], a2: string[]): string[] {
    return [...new Set(a1.filter((n: any) => { return a2.indexOf(n) !== -1; }))]
}

export function getCommonOpponentRecord(rawData: any, commonOpponentNames: string[]): CommonOpponontFights {
    var records: CommonOpponontFights = {
        name: getFighterName(rawData),
        win: 0,
        loss: 0,
        fights: null,
    }
    var fightsRecord: Fight[] = []
    commonOpponentNames.forEach((name: any) => {
        for (let rawFightData of rawData.included) {
            if (rawFightData.attributes.status == 'confirmed' && rawFightData.attributes.opponent_fighter_name == name) {
                if (rawFightData.attributes.result_description == RESULT_WIN) {
                    records.win += 1
                }
                if (rawFightData.attributes.result_description == RESULT_LOSS) {
                    records.loss += 1
                }
                var rawFightAttributes = rawFightData.attributes
                var commonOpponentfight: Fight = {
                    id: rawData.included[0].id,
                    eventName: rawFightAttributes.event_name,
                    eventSubname: `${getFighterName(rawData)} VS ${rawFightAttributes.opponent_fighter_name}`,
                    tournament: rawFightAttributes.promotion_acronym,
                    date: rawFightAttributes.event_date,
                    status: rawFightAttributes.event_date.status,
                    titleFight: rawFightAttributes.title_fight,
                    ischampionshipFight: (rawFightAttributes.title_fight != null) ? true : false,
                    weightClass: rawFightAttributes.weight_class,
                    home: {
                        name: getFighterName(rawData),
                        bettingOdds: rawFightAttributes.betting_odds,
                        underdog: checkUnderdog(rawFightAttributes.betting_odds_described),
                        favorite: checkFavorite(rawFightAttributes.betting_odds_described),
                        titleStatus: rawFightAttributes.title_status
                    },
                    away: {
                        name: rawFightData.attributes.opponent_fighter_name,
                        bettingOdds: null,
                        underdog: !checkUnderdog(rawFightData.attributes.betting_odds_described),
                        favorite: !checkFavorite(rawFightData.attributes.betting_odds_described),
                        titleStatus: null,
                    },
                    result: {
                        home: rawFightData.attributes.result_description,
                        away: guessAwayResult(rawFightData.attributes.result_description),
                        finishingMethod: rawFightData.finishing_method,
                    },
                }
                fightsRecord.push(commonOpponentfight)
            }
        }
    });
    if (fightsRecord.length == 0) {
        return records
    }
    records.fights = fightsRecord
    return records
}
function guessAwayResult(result_description: string): Nullable<string> {
    if (result_description == RESULT_WIN) { return RESULT_LOSS }
    if (result_description == RESULT_WIN) { return RESULT_WIN }
    if (result_description == RESULT_NO_CONTEST) { return RESULT_NO_CONTEST }
    if (result_description == null) { return null }
    return null
}

export function getCommonOpponentTable(homeRecord: CommonOpponontFights, awayRecord: CommonOpponontFights, commonOppNames: string[]): Nullable<string[][]> {
    var tableRows: string[][] = []
    if (commonOppNames.length == 0 || homeRecord.fights == null || awayRecord.fights == null) {
        return null
    }
    if (homeRecord.fights.length != awayRecord.fights.length) {
        return null
    }
    var homeName = `${homeRecord.name}(${homeRecord.win}-${homeRecord.loss})` // e.g. Peter(5-1)
    var awayName = `${awayRecord.name}(${awayRecord.win}-${awayRecord.loss})`
    var header: string[] = [homeName, 'Opponent', awayName]
    tableRows.push(header)

    commonOppNames.forEach((name: any, index: number) => {
        if (homeRecord.fights == null || awayRecord.fights == null) {
            return // continue
        }
        var homeOdds = `${homeRecord.fights[index].result.home}(${homeRecord.fights[index].home.bettingOdds})`
        var commonOpponentName = `${name}`
        var awayOdds = `${awayRecord.fights[index].result.home}(${awayRecord.fights[index].home.bettingOdds})`
        tableRows.push([homeOdds, commonOpponentName, awayOdds])
    })
    return tableRows
}

