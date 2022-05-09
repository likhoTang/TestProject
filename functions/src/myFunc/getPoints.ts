import { FighterStats } from "../entity/FighterStats"
import { InterestingPoints } from "../entity/InterestingPoints"
import { ScheduledFight } from "../entity/scheduledFight"

export const HOME_STR = 'home'
export const AWAY_STR = 'away'

export function getInterestingPoints(scheduledFight: ScheduledFight, targetFighterStats: FighterStats, targetSide: string, anotherFighterStats: FighterStats): InterestingPoints {
    var interestingPoints: InterestingPoints = {
        name: targetFighterStats.name,
        details: []
    }

    var stringArray: string[] = []

    var describedWinRateStr = (targetSide == HOME_STR) ? getDescribedWinHighlight(scheduledFight.home, targetFighterStats) : getDescribedWinHighlight(scheduledFight.away, targetFighterStats)
    if (describedWinRateStr !== "") { stringArray.push(describedWinRateStr) }

    var championshipFightStr = getChampionshipFightHighlight(scheduledFight, targetFighterStats)
    if (championshipFightStr !== "") { stringArray.push(championshipFightStr) }

    var bonusesStr = getBonusesHighlight(scheduledFight, targetFighterStats)
    if (bonusesStr !== "") { stringArray.push(bonusesStr) }

    var MissedWeightStr = getMissedWeightHighlight(scheduledFight, targetFighterStats)
    if (MissedWeightStr !== "") { stringArray.push(MissedWeightStr) }

    var undefeatedStr = getUndefeatedHighlight(targetFighterStats)
    if (undefeatedStr !== "") { stringArray.push(undefeatedStr) }

    var koStr = getKoHighlight(targetFighterStats, anotherFighterStats)
    if (koStr !== "") { stringArray.push(koStr) }

    var subStr = getSubHighlight(targetFighterStats, anotherFighterStats)
    if (subStr !== "") { stringArray.push(subStr) }

    interestingPoints.details = stringArray
    return interestingPoints
}
export function getDescribedWinHighlight(scheduledFight_Fighter: any, fighterStats: any): string {
    if (scheduledFight_Fighter.underdog) {
        return `${fighterStats.asUnderdog.win}-${fighterStats.asUnderdog.loss}record when fighting as underdog`
    }
    if (scheduledFight_Fighter.favorite) {
        return `${fighterStats.asFavorite.win}-${fighterStats.asFavorite.loss}record when fighting as favorite`
    }
    return ''
}

export function getChampionshipFightHighlight(scheduledFight: any, fighterStats: any): string {
    if (scheduledFight.ischampionshipFight) {
        return `${(fighterStats.championshipFight.loss == 0) ? 'Undefeated' : ''}${fighterStats.championshipFight.win}-${fighterStats.championshipFight.loss}record in championship fights.`
    }
    return ''

}

export function getBonusesHighlight(scheduledFight: any, fighterStats: any): string {
    // Only notable if: (3 or more bonuses & > 50% rate) OR 5+ bonuses
    var tournament = scheduledFight.tournament
    var totalFights = fighterStats.fightHistory[tournament].totalFights
    var bounseTimes = fighterStats.fightHistory[tournament].bounseTimes
    var bounseRate = bounseTimes / totalFights
    var bounseRateStr = `(${Math.round(bounseRate * 100).toFixed(0)}%)`

    if (bounseTimes >= 5 || (bounseRate > 0.5 && bounseTimes >= 3)) {
        return `${bounseTimes} bonuses in 9 ${tournament} fights ${bounseRateStr}`
    }
    return ''
}

export function getMissedWeightHighlight(scheduledFight: any, fighterStats: any): string {
    var tournament = scheduledFight.tournament
    var missedWeight = fighterStats.fightHistory[tournament].missedWeightTimes
    var fightsSincelastMissedWeight = fighterStats.fightHistory[tournament].fightsSincelastMissedWeight
    if (missedWeight == 0) {
        `Never missed weight in ${tournament}`
    }
    return `Missed weight ${missedWeight} times in ${tournament} (${fightsSincelastMissedWeight} fights since last weigh in miss)`
}

export function getUndefeatedHighlight(fighterStats: any): string {
    //Notable after 4 fights without a loss
    var undefeatedCount = fighterStats.undefeated.undefeatedCount
    var lastLossFinalRound = fighterStats.undefeated.lastLossFinalRound
    var lastLossFinishingMethod = fighterStats.undefeated.lastLossFinishingMethod
    var lastdefeatedBy = fighterStats.undefeated.lastdefeatedBy
    var lastLossDate = fighterStats.undefeated.lastLossDate

    if (undefeatedCount >= 4) {
        return `Undefeated in ${undefeatedCount} fights (Last Loss: R${lastLossFinalRound} ${lastLossFinishingMethod}, ${lastdefeatedBy}, ${lastLossDate})`
    }

    return ``
}

export function getKoHighlight(targetFighterStats: any, anotherFighterStats: any): string {
    // 18 knockouts (Oliveira KO’d 4 times, last by Felder Dec 2017)
    //Notable if the fighter has 50% or higher win rate by TKO or SUB 
    //& while the opponent has 3+ losses by that same means.

    // 20 Submissions (Gaethje last loss by R2 SUB, K.Nurmagomedov, Oct 2020) 
    //Notable if the fighter has 50% or higher win rate by TKO or SUB.
    //Include second part if the opponent has been finished by same means before.
    var koTimes = targetFighterStats.fightHistory.overAll.win.tko
    var totalWin = targetFighterStats.fightHistory.overAll.win.total
    var winRateByko = koTimes / totalWin

    var opponentName = anotherFighterStats.name
    var opponentlossByKoTimes = anotherFighterStats.fightHistory.overAll.loss.tko
    var opponentLastKoByName = anotherFighterStats.lastKoBy.name
    var opponentLastKoByDate = anotherFighterStats.lastKoBy.date
    var opponentLastKoByFinalRound = anotherFighterStats.lastKoBy.finalRound
    if (winRateByko >= 0.5 && opponentlossByKoTimes >= 3) {
        return `${koTimes} knockouts (${opponentName} KO’d ${opponentlossByKoTimes} times, last by ${opponentLastKoByName}, ${opponentLastKoByDate})`
    } else
        if (winRateByko >= 0.5 && opponentlossByKoTimes > 0) {
            return `${koTimes} knockouts (${opponentName} last loss by R${opponentLastKoByFinalRound} KO'd, ${opponentLastKoByName} , ${opponentLastKoByDate}) `
        }
    return ''
}

export function getSubHighlight(targetFighterStats: any, anotherFighterStats: any): string {
    // 18 knockouts (Oliveira KO’d 4 times, last by Felder Dec 2017)
    //Notable if the fighter has 50% or higher win rate by TKO or SUB 
    //& while the opponent has 3+ losses by that same means.

    // 20 Submissions (Gaethje last loss by R2 SUB, K.Nurmagomedov, Oct 2020) 
    //Notable if the fighter has 50% or higher win rate by TKO or SUB.
    //Include second part if the opponent has been finished by same means before.
    var subTimes = targetFighterStats.fightHistory.overAll.win.sub
    var totalWin = targetFighterStats.fightHistory.overAll.win.total

    var winRateBysub = subTimes / totalWin

    var opponentName = anotherFighterStats.name
    var opponentlossBySubTimes = anotherFighterStats.fightHistory.overAll.loss.sub
    var opponentLastSubByName = anotherFighterStats.lastSubBy.name
    var opponentLastSubByDate = anotherFighterStats.lastSubBy.date
    var opponentLastSubByFinalRound = anotherFighterStats.lastSubBy.finalRound
    if (winRateBysub >= 0.5 && opponentlossBySubTimes >= 3) {
        return `${subTimes} Submissions (${opponentName} SUB ${opponentlossBySubTimes} times, last by ${opponentLastSubByName}, ${opponentLastSubByDate})`
    }
    if (winRateBysub >= 0.5 && opponentlossBySubTimes > 0) {
        return `${subTimes} Submissions (${opponentName} last loss by R${opponentLastSubByFinalRound} SUB, ${opponentLastSubByName} , ${opponentLastSubByDate}) `
    }
    return ''
}