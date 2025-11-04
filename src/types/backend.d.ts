export { }

declare global {
    interface IRequest {
        url: string,
        method?: string,
        body?: { [key: string]: any },
        queryParams?: any,
        useCredentials?: boolean,
        headers?: any,
        nextOption?: any
    }
    interface IBackendResponse<T> {
        error?: string | string[],
        message: string | string[],
        statusCode: number | string,
        data?: T
    }
    interface IAuth<T> {
        access_token: string,
        refresh_token: string,
        user: T
    }
    interface IUser {
        _id: string,
        fullname: string,
        email: string,
        image: string,
        role: string,
        createdAt: string,
        updatedAt: string
    }
}