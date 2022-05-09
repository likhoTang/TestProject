import * as functions from "firebase-functions";
import * as myFunc from "./myFunc/myFunc";
import { QueryString } from "./entity/QueryString";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

exports.getScheduledFight = functions.https.onRequest(async (req, res) => {
    const { url1, url2 } = req.query as unknown as QueryString;
    const rawData1 = await myFunc.getDataFromUrl(url1)
    const rawData2 = await myFunc.getDataFromUrl(url2)

    var sheduledFight = myFunc.getScheduledFight(rawData1, rawData2)

    var result = {
        scheduledFight: sheduledFight,
    }

    res.status(200).json(result)
});