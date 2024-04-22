export function oddsToString(odds: number) {
    if (odds < 0) {
        return odds.toString()
    } else {
        return `+${odds.toString()}`
    }   
}

export function amountToString(amount: number) {
    return `$${amount}`
}

export function parsedAmount(val: string, prefix: string) {
    if (!val) {
        return undefined
    }
    const asNum = Number(val.startsWith(prefix) ? val.slice(1) : val)
    return isNaN(asNum) ? undefined : asNum
}

export function dateFormatter(s: string) {
    let formatted = "";

    let sinceLastSlash = 0
    let segmentIndex = 0

    for (var i=0; i < s.length; i++) {
        const char = s[i]
        if (char == "/") {
            formatted = formatted + "/"
            sinceLastSlash = 0
            segmentIndex+=1
        } else {
            if (segmentIndex >= 2 || sinceLastSlash < 2) {
                formatted = formatted + char
                sinceLastSlash += 1
            } else {
                formatted += `/${char}`
                sinceLastSlash=0
                segmentIndex+=1
            }
            
        }
    }
    if (sinceLastSlash === 2 && segmentIndex < 2) {
        formatted += "/"
    }
    return formatted
}