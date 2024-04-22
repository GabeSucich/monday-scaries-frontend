import { Bettor, BettorUserData, CreateDepositData, ModifiedUser } from "../types";
import { AbstractAPI } from "./AbstractAPI";

export default class BettorAPI extends AbstractAPI {

    byId(bettorId: string) {
        return this.get<Bettor | null>("/api/bettors/" + bettorId)
    }

    bettors(userId: string) {
        return this.get<Bettor[]>("/api/bettors/user/" + userId)
    }

    deposit(data: CreateDepositData) {
        return this.post<CreateDepositData, boolean>("/api/bettors/deposit", data)
    }

    getBettorUser(bettorId: string) {
        return this.get<ModifiedUser>("/api/users/bettor/" + bettorId)
    }

    bettorGroupBettors(bettorGroupId: string) {
        return this.get<Bettor[]>("/api/bettors/bettorGroup/" + bettorGroupId)
    }
    
}