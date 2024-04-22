import Axios, { AxiosResponse } from "axios"

const urlPrefix = process.env.EXPO_PUBLIC_SERVER_ENDPOINT

function makeUrl(suffix: string) {
    return `${urlPrefix}${suffix.startsWith('/') ? '' : ''}${suffix}`
}

export type ResponseObj<T> = {
    data?: T,
    error?: string
}

export type Result<T> = {
    raw?: AxiosResponse<ResponseObj<T>>,
    data?: T,
    status?: number
    responseError?: string
    axiosError?: any
}

function _handleResponsePromise<U>(responsePromise: Promise<AxiosResponse<ResponseObj<U>>>, onNotLoggedIn?: () => Promise<any>): Promise<Result<U>> {
    return responsePromise.then((res: AxiosResponse<ResponseObj<U>>) => {
        return {
            raw: res,
            status: res.status,
            data: res.data?.data !== undefined ? res.data.data : undefined,
            axiosError: res.data.error,
            responseError: res.data?.error !== undefined ? res.data.error : undefined
        } as Result<U>
        
    }).catch((error: any) => {
        const result = {
            raw: error.response ?? undefined,
            data: undefined,
            status: error.response?.status ?? undefined,
            responseError: error.response?.data?.error ?? undefined,
            error: error
        } as Result<U>
        if (error.response?.status === 401 && result.responseError === "User is not authenticated") {
            return onNotLoggedIn ? onNotLoggedIn().then(() => result): result
        } else {
            return result
        }
        
    })
}

function getRequest<U>(urlSuffix: string, on401?: () => Promise<any>): Promise<Result<U>> {
    const url = makeUrl(urlSuffix)
    return _handleResponsePromise(Axios.get(url), on401)
}

function postRequest<U, V>(urlSuffix: string, data: U, on401?: () => any): Promise<Result<V>> {
    const url = makeUrl(urlSuffix)
    return _handleResponsePromise(Axios.post(url, data), on401)
}

export abstract class AbstractAPI {
    constructor(
        private on401?: (() => Promise<any>) | undefined
    ) {}

    protected get<T>(url: string, on401?: (() => Promise<any>)) {
        return getRequest<T>(url, on401 || this.on401)
    }

    protected post<U, V>(url: string, data: U, on401?: (() => Promise<any>)) {
        return postRequest<U, V>(url, data, on401 || this.on401)
    }
}