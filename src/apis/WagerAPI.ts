import { CreateWagerData, UpdateWagerInfoData, UpdateWagerResultData, Wager } from "../types"
import { AbstractAPI } from "./AbstractAPI"

export default class WagerAPI extends AbstractAPI {

    bettorWagers(bettorId: string, startTimestamp?: number, endTimestamp?: number) {
        let url = "/api/wagers/bettor/" + bettorId + (startTimestamp || endTimestamp ? '?' : '')
        if (startTimestamp) {
            url += "startTimestamp=" + startTimestamp
        }
        if (endTimestamp) {
            url += "endTimestamp=" + endTimestamp
        }
        return this.get<Wager[]>(url)
    }

    createWager(data: CreateWagerData) {
        return this.post<CreateWagerData, Wager>("/api/wagers/create", data)
    }

    getSports() {
        return this.get<string[]>("/api/wagers/sports")
    }

    getBetTypes() {
        return this.get<string[]>("/api/wagers/betTypes")
    }

    updateWagerInfo(updateWagerInfoData: UpdateWagerInfoData) {
        return this.post<UpdateWagerInfoData, Wager>("/api/wagers/update-info", updateWagerInfoData)
    }

    updateWagerResults(updateWagerResultData: UpdateWagerResultData) {
        return this.post<UpdateWagerResultData, Wager>("/api/wagers/update-results", updateWagerResultData)
    }
}
