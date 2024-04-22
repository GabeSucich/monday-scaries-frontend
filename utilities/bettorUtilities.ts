import { Bettor, BettorDeposit, Wager } from "../src/types"

export function bettorProfit(bettor: Bettor, activeWagers: Wager[]) {
    const initialDeposit = bettor.deposits.find(d => !d.isReBuy)
    const rebuysAndSupplements = bettor.deposits.filter(d => d.isReBuy || d.isQuarterlySupplement)
    const currentBalance = bettor.balance

    let effectiveBalance = currentBalance
    rebuysAndSupplements.forEach(r => {
        effectiveBalance -= r.amount
    })

    const pendingBetAmount = activeWagers.filter(w => !w.result).reduce((a, b) => a + b.amount, 0)
    effectiveBalance += pendingBetAmount

    return parseFloat((effectiveBalance - (initialDeposit?.amount ?? 0)).toFixed(2))
}


export function sortWagers(wagers: Wager[]) {
    function sorter(w1: Wager, w2: Wager) {
        if (w1.result && !w2.result) {
            return 1
        } else if (!w1.result && w2.result) {
            return -1
        } else {
            if (w1.createdAt < w2.createdAt) {
                return 1
            } else {
                return -1
            }
        }
    }
    return [...wagers].sort(sorter)
}

type WagerDepositEntry = {
    type: "wager"|"deposit"
    timestamp: number
    amount: number
    isReBuy?: boolean
}

export function createSortedWagerDepositEntries(wagers: Wager[], deposits: BettorDeposit[]) {
    const entries: WagerDepositEntry[] = []
    wagers.forEach(w => {
        entries.push({
            type: "wager",
            timestamp: w.createdAt,
            amount: w.amount,
        })
    })
    deposits.forEach(d => {
        entries.push({
            type: "deposit",
            timestamp: d.createdAt,
            amount: d.amount,
            isReBuy: d.isReBuy
        })
    })

    return entries.sort((e1, e2) => e1.timestamp - e2.timestamp)

}

export function wagersToLineChartData(wagers: Wager[], deposits: BettorDeposit[]) {
    const completeWagers = wagers.filter(w => w.result)
    completeWagers.sort((w1, w2) => w1.createdAt - w2.createdAt)
    let currentVal = 0
    const chartVals = [currentVal]
    completeWagers.forEach(w => {
        const wagerBalanceChange = (w.payout ?? 0) - w.amount
        currentVal = currentVal + wagerBalanceChange
        chartVals.push(currentVal)
    })
    return chartVals
}