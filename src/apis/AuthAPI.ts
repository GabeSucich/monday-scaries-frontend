import { ModifiedUser, UserRegistrationData } from "../types"
import { AbstractAPI } from "./AbstractAPI"


export default class AuthAPI extends AbstractAPI {
    register(firstName: string, lastName: string, username: string, password: string) {
        const data = {
            firstName,
            lastName,
            username,
            password
        }
        return this.post<UserRegistrationData, ModifiedUser>("/api/register", data)
    }

    login(username: string, password: string) {
        const data = {username, password}
        return this.post<{username: string, password: string} | false, ModifiedUser>("/api/login", data).then(result => {
            if (result.status === 401) {
                result.responseError = "Incorrect username and/or password"
            }
            return result
        })
    }

    user(_id: string) {
        return this.get<ModifiedUser | null>("/api/users/" + _id)
    }

    users() {
        return this.get<ModifiedUser[]>("/api/users")
    }
}