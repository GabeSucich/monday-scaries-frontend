import { Wager } from "../src/types"

export type QuarterNum = 1 | 2 | 3 | 4
export interface DateDesignation {
    year: number
    month: number,
    day: number,
    quarterNum: QuarterNum,
}

function contestDateDesToQuarterString(cd: DateDesignation) {
    return `${cd.year}-Q${cd.quarterNum}`
}

export function parseQuarterDateString(quarterDateString: string): {year: number, quarter: QuarterNum} {
    const [year, quarter] = quarterDateString.split("-Q").map(v => Number(v))
    return {
        year,
        quarter: quarter as QuarterNum
    }
}

export function monthToQuarter(month: number): QuarterNum {
    if (month < 1 || month > 12) {
        return undefined
    }
    if (month <= 3) {
        return 1
    } else if (month <= 6) {
        return 2
    } else if (month <= 9) {
        return 3
    } else {
        return 4
    }
}

function dateStringToContestDate(dateString: string, defaultContestDate: DateDesignation): DateDesignation {
    let quarterNum = defaultContestDate.quarterNum
    let year = defaultContestDate.year
    let month = defaultContestDate.month
    let day = defaultContestDate.day

    let parsedDay = ""
    let parsedMonth = ""
    let parsedYear = ""

    if (dateString.includes("/")) {
        const segments = dateString.split("/").map(s => s.trim())
        if (segments.length === 3) {
            [parsedMonth, parsedDay, parsedYear] = segments
        }
    } else if (dateString.includes("-")) {
        const segments = dateString.split("-").map(s => s.trim())
        if (segments.length === 3) {
            [parsedYear, parsedMonth, parsedDay] = segments
        }
    }
    if (parsedDay && !isNaN(Number(parsedDay))) {
        day = Number(parsedDay)
    }
    if (parsedMonth && !isNaN(Number(parsedMonth))) {
        month = Number(parsedMonth)
        quarterNum = monthToQuarter(month) ?? quarterNum
    }
    if (parsedYear && !isNaN(Number(parsedYear))) {
        if (parsedYear.length === 2) {
            year = Number(`20${parsedYear}`)
        } else if (parsedYear.length === 4) {
            year = Number(parsedYear)
        }
    }
    
    return {
        quarterNum,
        day,
        month,
        year
    }
}

export class ContestDate {
    private _contestDate: DateDesignation
    constructor(
        public contestDateString: string,
        public defaultDate: DateDesignation = {year: 2024, quarterNum: 1, day: 1, month: 1}
    ) {
        this._contestDate = dateStringToContestDate(contestDateString, defaultDate)
    }

    matchesDateDesignation(des: Partial<DateDesignation>) {
        const cond1 = !des.year || this.year() === des.year
        const cond2 = !des.quarterNum || this.quarterNum() === des.quarterNum
        const cond3 = !des.day || this.day() === des.day
        const cond4 = !des.month || this.month() === des.month
        return cond1 && cond2 && cond3 && cond4
    }

    isSameQuarter(other: ContestDate) {
        return this.year() === other.year() && this.quarterNum() === other.quarterNum()
    }

    quarterDateString() {
        return contestDateDesToQuarterString(this._contestDate)
    }

    year() {
        return this._contestDate.year
    }

    quarterNum() {
        return this._contestDate.quarterNum
    }

    month() {
        return this._contestDate.month
    }

    day() {
        return this._contestDate.day
    }
}


export function organizeWagersByQuarter(wagers: Wager[], _defaultContestDate: Partial<DateDesignation>): {
    year: number,
    quarter: number,
    wagers: Wager[]
}[] {
    const defaultContestDate: DateDesignation = {...{year: 2024, quarterNum: 1, month: 1, day: 1}, ..._defaultContestDate}
    const wagersByQuarter: Record<string, Wager[]> = {}
    wagers.forEach(wager => {
        const contestDate = new ContestDate(wager.contestDate, defaultContestDate)
        const quarterDesString = contestDate.quarterDateString()
        wagersByQuarter[quarterDesString] = (wagersByQuarter[quarterDesString] ?? []).concat([wager])
    })
    
    return Object.entries(wagersByQuarter).map(([quarterDateString, wagers]) => {
        const {year, quarter} = parseQuarterDateString(quarterDateString)
        return {
            year,
            quarter,
            wagers
        }
    }).sort((a, b) => a.year*10 + a.quarter - b.year*10 - b.quarter)
}

export function organizeWagersByYear(wagers: Wager[], _defaultContestDate: Partial<DateDesignation>): {
    year: number,
    wagers: Wager[]
}[] {
    const defaultContestDate: DateDesignation = {...{year: 2024, quarterNum: 1, month: 1, day: 1}, ..._defaultContestDate}
    const wagersByYear: Record<number, Wager[]> = {}
    wagers.forEach(wager => {
        const contestDate = new ContestDate(wager.contestDate, defaultContestDate)
        wagersByYear[contestDate.year()] = (wagersByYear[contestDate.year()] ?? []).concat(wager)
    })

    return Object.entries(wagersByYear).map(([year, wagers]) => {
        return {
            year: Number(year),
            wagers
        }
    }).sort((a, b) => a.year - b.year)
}