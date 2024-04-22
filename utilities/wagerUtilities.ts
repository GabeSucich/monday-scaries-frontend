import { Wager } from "../src/types"

export type QuarterDesignation = {
    year: string
    quarterNum: number
}

function quarterDesToString(des: QuarterDesignation) {
    return `${des.year}-${des.quarterNum}`
}

function quarterStringToDes(quarterString: string): QuarterDesignation {
    const [year, quarterNumStr] = quarterString.split("-").map(s => s.trim())
    return {
        year,
        quarterNum: Number(quarterNumStr)
    }
}

function monthToQuarter(month: number) {
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

function dateToQuarterDesignation(dateString: string, defaultQuarterDes: QuarterDesignation): QuarterDesignation {
    let quarterNum: number = defaultQuarterDes.quarterNum
    let yearDesignation: string = defaultQuarterDes.year

    let parsedMonth: string = ""
    let parsedYear: string = ""

    if (dateString.includes("/")) {
        const segments = dateString.split("/").map(s => s.trim())
        if (segments.length === 3) {
            parsedMonth = segments[0]
            parsedYear = segments[2]
        }
    } else if (dateString.includes("-")) {
        const segments = dateString.split("-").map(s => s.trim())
        if (segments.length === 2) {
            parsedMonth = segments[1]
            parsedYear = segments[0]
        }
    }
    if (parsedMonth) {
        if (!isNaN(Number(parsedMonth))) {
            quarterNum = monthToQuarter(Number(parsedMonth)) ?? quarterNum
        }
    }
    if (parsedYear) {
        if (parsedYear.length === 2) {
            yearDesignation = `20${parsedYear}`
        } else if (parsedYear.length === 4) {
            yearDesignation = parsedYear
        }
    }
    
    return {
        quarterNum,
        year: yearDesignation
    }
}

class ContestDate {
    public quarterDesignation: QuarterDesignation
    constructor(
        public contestDateString: string,
        public defaultQuarterDes: QuarterDesignation = { year: "2024", quarterNum: 1 }
    ) {
        this.quarterDesignation = dateToQuarterDesignation(contestDateString, defaultQuarterDes)
    }

    isSameQuarter(other: QuarterDesignation) {
        return this.quarterDesString() === quarterDesToString(other)
    }

    quarterDesString() {
        return quarterDesToString(this.quarterDesignation)
    }
}


export function organizeWagersByQuarter(wagers: Wager[], defaultQuarterDes: QuarterDesignation = {year: "2024", quarterNum: 1}): {
    contestDate: ContestDate,
    wagers: Wager[]
}[] {
    const wagersByQuarter: Record<string, Wager[]> = {}
    wagers.forEach(wager => {
        const contestDate = new ContestDate(wager.contestDate, defaultQuarterDes)
        const quarterDesString = contestDate.quarterDesString()
        wagersByQuarter[quarterDesString] = (wagersByQuarter[quarterDesString] ?? []).concat([wager])
    })
    
    return Object.entries(wagersByQuarter).map(([_, wagers]) => {
        return {
            contestDate: new ContestDate(wagers[0].contestDate, defaultQuarterDes),
            wagers
        }
    })
}