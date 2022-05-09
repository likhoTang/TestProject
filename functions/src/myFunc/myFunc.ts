import axios, { AxiosResponse, AxiosError } from 'axios';
import { FieldStat, FighterStats, KoOrSubBY, Undefeated } from '../entity/FighterStats';
import { myDictionary } from '../entity/myDictionary';
import { Fight } from '../entity/scheduledFight'

const UNDERDOG_STR = 'Underdog';
const FAVORITE_STR = 'Favorite';
const mmaTourNames: string[] = ['UFC', 'ROC', 'JFC', 'WC', 'WSOF', 'overAll']
export const RESULT_WIN = "Win";
export const RESULT_LOSS = "Loss";
export const RESULT_NO_CONTEST = "No Contest"
const CATCH_WEIGHT = 'Catchweight';
const FINISHING_METHOD_KO = 'KO/TKO'
const FINISHING_METHOD_SUB = 'Submission'
const FINISHING_METHOD_DEC = 'Decision'

// axios get raw data from Url
export async function getDataFromUrl(url: string) {
    const data = await axios.get(url)
        .then((result: AxiosResponse) => {
            return result.data
        }).catch((err: AxiosError) => {
            console.error(err);
            throw err
        });

    return data
}

export function getScheduledFight(rawData1: any, rawData2: any): Fight {
    // scheduled Fight Data ->Home
    var sFDataHome = rawData1.included[0].attributes
    // scheduled Fight Data ->Away
    var sFDataAway = rawData2.included[0].attributes

    var scheduledFight: Fight = {
        id: rawData1.included[0].id,
        eventName: sFDataHome.event_name,
        eventSubname: `${getFighterName(rawData1)} VS ${getFighterName(rawData2)}`,
        tournament: sFDataHome.promotion_acronym,
        date: sFDataHome.event_date,
        status: sFDataHome.event_date.status,
        titleFight: sFDataHome.title_fight,
        ischampionshipFight: (sFDataHome.title_fight != null) ? true : false,
        weightClass: sFDataHome.weight_class,
        home: {
            name: getFighterName(rawData1),
            bettingOdds: sFDataHome.betting_odds,
            underdog: checkUnderdog(sFDataHome.betting_odds_described),
            favorite: checkFavorite(sFDataHome.betting_odds_described),
            titleStatus: sFDataHome.title_status
        },
        away: {
            name: getFighterName(rawData2),
            bettingOdds: sFDataAway.betting_odds,
            underdog: checkUnderdog(sFDataAway.betting_odds_described),
            favorite: checkFavorite(sFDataAway.betting_odds_described),
            titleStatus: sFDataAway.title_status
        },
        result: {
            home: sFDataHome.result_description,
            away: sFDataAway.result_description,
            finishingMethod: sFDataHome.finishing_method,
        },
    }

    return scheduledFight
}

export function getFighterName(rawData: any): string {
    const fighterName = rawData.data.attributes.short_name
    return fighterName
}

export function checkUnderdog(describe: String): boolean {
    if (describe.includes(UNDERDOG_STR)) {
        return true
    }
    return false
}
export function checkFavorite(describe: String): boolean {
    if (describe.includes(FAVORITE_STR)) {
        return true
    }
    return false
}

export function getFighterStats(rawData: any): FighterStats {
    var fighterStats: FighterStats = {
        name: getFighterName(rawData),
        fightHistory: getfighthistoryGroup(rawData),
        asFavorite: getFightAsFavouriteRecord(rawData),
        asUnderdog: getFightAsUnderdogRecord(rawData),
        championshipFight: getChampionshipFightRecord(rawData),
        undefeated: getUndefeatedRecord(rawData),
        lastKoBy: getLastKoByRecord(rawData),
        lastSubBy: getLastSubByRecord(rawData),
    }

    return fighterStats

}

function getfighthistoryGroup(rawData: any): myDictionary {
    var fighthistoryGroup: myDictionary = {};
    for (let index in mmaTourNames) {
        var name = mmaTourNames[index]
        fighthistoryGroup[name] = getfightHistory(rawData, name)
    }
    return fighthistoryGroup
}
function isMissedWeight(w_class: string, scheduled_weight: number, weigh_in_lb: number, is_championship_fight: boolean): boolean {
    // Weight Class = Catchweight AND weigh_in_lb <= scheduled_weight
    //                             or
    // Weight Class != Catchweight AND weigh_in_lb+1 < scheduled_weight
    // Only + 1 if the fight is NOT a championship fight.

    if (!is_championship_fight && w_class == CATCH_WEIGHT && weigh_in_lb <= scheduled_weight) {
        return true
    }
    if (!is_championship_fight && w_class != CATCH_WEIGHT && weigh_in_lb + 1 < scheduled_weight) {
        return true
    }

    return false
}

function getfightHistory(rawData: any, tourNames: string): myDictionary {
    var result: myDictionary = {
        win: {
            tko: 0,
            sub: 0,
            dec: 0,
            total: 0,
        },
        loss: {
            tko: 0,
            sub: 0,
            dec: 0,
            total: 0,
        },
        noContest: {
            tko: 0,
            sub: 0,
            dec: 0,
            total: 0,
        },
        totalFights: 0,
        bounseTimes: 0,
        missedWeightTimes: 0,
        fightsSincelastMissedWeight: null
    }

    var lasted_missed_weight_fight_id: any = null
    rawData.included.forEach((element: any) => {
        if (tourNames == 'overAll') {
            if (element.attributes.status != 'confirmed' ||
                element.attributes.result_description == null) { return }
        } else {
            if (element.attributes.promotion_acronym != tourNames ||
                element.attributes.status != 'confirmed' ||
                element.attributes.result_description == null) { return } // filter tournament (e.g.UFC,)and cancled fight
        }

        result.totalFights += 1 //totalFights
        if (element.attributes.result_description == RESULT_WIN) { // win 
            result.win.total += 1
            if (element.attributes.finishing_method == FINISHING_METHOD_KO) {
                result.win.tko += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_SUB) {
                result.win.sub += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_DEC) {
                result.win.dec += 1
            }
        }
        if (element.attributes.result_description == RESULT_LOSS) { //loss
            result.loss.total += 1
            if (element.attributes.finishing_method == FINISHING_METHOD_KO) {
                result.loss.tko += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_SUB) {
                result.loss.sub += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_DEC) {
                result.loss.dec += 1
            }
        }
        if (element.attributes.result_description == RESULT_NO_CONTEST) { //no Ccontest
            result.noContest.total += 1
            if (element.attributes.finishing_method == FINISHING_METHOD_KO) {
                result.noContest.tko += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_SUB) {
                result.noContest.sub += 1
            }
            if (element.attributes.finishing_method == FINISHING_METHOD_DEC) {
                result.noContest.dec += 1
            }
        }
        if (element.attributes.pay_breakdown != null) {// bounse Times
            if (element.attributes.pay_breakdown.includes('/Night')) {
                result.bounseTimes += 1
            }
        }
        if (element.attributes.weight_class != null && element.attributes.scheduled_weight != null
            && element.attributes.weigh_in_lb != null) {// count missed weight
            var weight_class: string = element.attributes.weight_class
            var scheduled_weight: number = + (element.attributes.scheduled_weight.split(" lbs")[0])
            var weigh_in_lb: number = +element.attributes.weigh_in_lb
            var is_championship_fight = (element.attributes.title_fight != null) ? true : false
            if (isMissedWeight(weight_class, scheduled_weight, weigh_in_lb, is_championship_fight)) {
                result.missedWeightTimes += 1
                if (lasted_missed_weight_fight_id == null) {
                    lasted_missed_weight_fight_id = element.id
                }
            }
        }

    });
    if (lasted_missed_weight_fight_id == null || result.missedWeight == 0) {
        result['fightsSincelastMissedWeight'] = null
    } else { //get how many fights Since last Missed Weight
        var countFights = 0
        for (let element of rawData.included) {
            if (tourNames == 'overAll') {
                if (element.attributes.status != 'confirmed' ||
                    element.attributes.result_description == null) { continue }
            } else {
                if (element.attributes.promotion_acronym != tourNames ||
                    element.attributes.status != 'confirmed' ||
                    element.attributes.result_description == null) { continue } // filter tournament (e.g.UFC,)and cancled fight
            }
            if (lasted_missed_weight_fight_id == element.id) {
                break;
            }
            countFights += 1
        }
        result['fightsSincelastMissedWeight'] = countFights
    }
    return result
}

function getFightAsFavouriteRecord(rawData: any): FieldStat {
    var favouriteRecord: FieldStat = {
        win: 0,
        loss: 0,
        total: 0,
    };
    rawData.included.forEach((element: any) => {
        if (element.attributes.betting_odds_described == null || element.attributes.status == 'cancelled') {
            return // continue
        };
        //Favorite
        if (element.attributes.betting_odds_described.includes(FAVORITE_STR)
            && (element.attributes.result_description == RESULT_WIN ||
                element.attributes.result_description == RESULT_LOSS)) {
            favouriteRecord.total += 1
            if (element.attributes.result_description == RESULT_WIN) {
                favouriteRecord.win += 1
            }
            if (element.attributes.result_description == RESULT_LOSS) {
                favouriteRecord.loss += 1
            }
        }
    });
    return favouriteRecord;
}

function getFightAsUnderdogRecord(rawData: any): FieldStat {
    var underdogRecord: FieldStat = {
        win: 0,
        loss: 0,
        total: 0,
    };

    rawData.included.forEach((element: any) => {
        if (element.attributes.betting_odds_described == null || element.attributes.status == 'cancelled') {
            return // continue
        };
        //Underdog 
        if (element.attributes.betting_odds_described.includes(UNDERDOG_STR)
            && (element.attributes.result_description == RESULT_WIN ||
                element.attributes.result_description == RESULT_LOSS)) {
            underdogRecord.total += 1
            if (element.attributes.result_description == RESULT_WIN) {
                underdogRecord.win += 1
            }
            if (element.attributes.result_description == RESULT_LOSS) {
                underdogRecord.loss += 1
            }
        }
    });
    return underdogRecord
}

function getChampionshipFightRecord(rawData: any): FieldStat {
    var championshipRecord: FieldStat = {
        win: 0,
        loss: 0,
        total: 0,
    };

    rawData.included.forEach((element: any) => {
        if (element.attributes.title_fight == null || element.attributes.status == 'cancelled' ||
            element.attributes.result_description == null) {
            return // continue
        };
        //ChampionshipFight 
        championshipRecord.total += 1
        if (element.attributes.result_description == RESULT_WIN) {
            championshipRecord.win += 1
        }
        if (element.attributes.result_description == RESULT_LOSS) {
            championshipRecord.loss += 1
        }
    });
    return championshipRecord
}

export function getUndefeatedRecord(data: any): Undefeated {
    var record: Undefeated = {
        undefeatedCount: 0,
        lastdefeatedBy: null,
        lastLossFinalRound: null,
        lastLossDate: null,
        lastLossFinishingMethod: null,
    }
    for (let element of data.included) {
        if (element.attributes.status != 'confirmed' ||
            element.attributes.result_description == null) {
            continue // filter tournament e.g. UFC, cancled fight
        }
        if (element.attributes.result_description == RESULT_LOSS) {
            record.lastLossFinalRound = element.attributes.final_round
            record.lastLossFinishingMethod = element.attributes.finishing_method
            record.lastdefeatedBy = element.attributes.opponent_fighter_name
            record.lastLossDate = element.attributes.event_date
            break
        }
        if (element.attributes.result_description !== RESULT_LOSS) { //no display as loss means is undefeated
            record.undefeatedCount += 1
        }
    }
    return record
}

export function getLastKoByRecord(rawData: any): KoOrSubBY {
    var lastKoByRecord: KoOrSubBY = {
        name: null,
        date: null,
        finalRound: null,
    }
    for (let element of rawData.included) {
        if (element.attributes.result_description == RESULT_LOSS) {
            if (element.attributes.finishing_method == FINISHING_METHOD_KO) {
                if (lastKoByRecord.date == null) {
                    lastKoByRecord.date = element.attributes.event_date
                }
                if (lastKoByRecord.finalRound == null) {
                    lastKoByRecord.finalRound = element.attributes.final_round
                }
                if (lastKoByRecord.name == null) {
                    lastKoByRecord.name = element.attributes.opponent_fighter_name
                }
                if (lastKoByRecord.name != null && lastKoByRecord.date != null && lastKoByRecord.finalRound != null) {
                    break;
                }
            }
        }
    }
    return lastKoByRecord

}

export function getLastSubByRecord(rawData: any): KoOrSubBY {
    var lastSubByRecord: KoOrSubBY = {
        name: null,
        date: null,
        finalRound: null,
    }
    for (let element of rawData.included) {
        if (element.attributes.result_description == RESULT_LOSS) {
            if (element.attributes.finishing_method == FINISHING_METHOD_SUB) {
                if (lastSubByRecord.date == null) {
                    lastSubByRecord.date = element.attributes.event_date
                }
                if (lastSubByRecord.finalRound == null) {
                    lastSubByRecord.finalRound = element.attributes.final_round
                }
                if (lastSubByRecord.name == null) {
                    lastSubByRecord.name = element.attributes.opponent_fighter_name
                }
                if (lastSubByRecord.name != null && lastSubByRecord.date != null && lastSubByRecord.finalRound != null) {
                    break;
                }

            }
        }
    }
    return lastSubByRecord
}