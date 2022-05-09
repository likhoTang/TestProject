import * as functions from "firebase-functions";
import * as myFunc from "./myFunc/myFunc";
import * as getPoints from "./myFunc/getPoints";
import * as commonOpponent from "./myFunc/commonOpponent";
import { QueryString } from "./entity/QueryString";
import CharlesOliveiraJson from './entity/Charles Oliveira.json'
import JustinGaethje from './entity/Justin Gaethje.json'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

exports.getScheduledFight = functions.https.onRequest(async (req, res) => {
    const { url1, url2 } = req.query as unknown as QueryString;
    const rawData1 = await myFunc.getDataFromUrl(url1)
    const rawData2 = await myFunc.getDataFromUrl(url2)
    // get sheduled Fight
    var sheduledFight = myFunc.getScheduledFight(rawData1, rawData2)

    // get fighter stats
    var fighterStatsHome = myFunc.getFighterStats(rawData1)
    var fighterStatsAway = myFunc.getFighterStats(rawData2)

    //gen some interesting points
    var home = getPoints.HOME_STR
    var away = getPoints.AWAY_STR
    var interestingPointHome = getPoints.getInterestingPoints(sheduledFight, fighterStatsHome, home, fighterStatsAway)
    var interestingPointAway = getPoints.getInterestingPoints(sheduledFight, fighterStatsAway, away, fighterStatsHome)

    // get common Opponent record
    var commonOpponentRecords = commonOpponent.getCommonOpponentRecords(rawData1, rawData2)

    var result = {
        scheduledFight: sheduledFight,
        homeStats: fighterStatsHome,
        awayStats: fighterStatsAway,
        interestingPoints: {
            home: interestingPointHome,
            away: interestingPointAway
        },
        commonOpponent: commonOpponentRecords
    }

    res.status(200).json(result)
});


// below is data for test
export const getJustinGaethje = functions.https.onRequest((request, response) => {
    response.json(JustinGaethje);
});

export const getCharlesOliveira = functions.https.onRequest((request, response) => {
    response.json(CharlesOliveiraJson);
});