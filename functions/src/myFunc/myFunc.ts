import axios, { AxiosResponse, AxiosError } from 'axios';
import { ScheduledFight } from '../entity/scheduledFight'

const UNDERDOG_STR = 'Underdog';
const FAVORITE_STR = 'Favorite';

// axios get raw data from Url
export async function getDataFromUrl(url: string) {
    const data = await axios.get(url)
        .then((result: AxiosResponse) => {
            return result.data
        }).catch((err: AxiosError) => err);
    return data
}

export function getScheduledFight(rawData1: any, rawData2: any): ScheduledFight {
    // scheduled Fight Data ->Home
    var sFDataHome = rawData1.included[0].attributes
    // scheduled Fight Data ->Away
    var sFDataAway = rawData2.included[0].attributes

    var scheduledFight: ScheduledFight = {
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

function getFighterName(rawData: any): string {
    const fighterName = rawData.data.attributes.short_name
    return fighterName
}

function checkUnderdog(describe: String): boolean {
    if (describe.includes(UNDERDOG_STR)) {
        return true
    }
    return false
}
function checkFavorite(describe: String): boolean {
    if (describe.includes(FAVORITE_STR)) {
        return true
    }
    return false
}
