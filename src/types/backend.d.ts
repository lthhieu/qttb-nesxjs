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
    interface IMeta {
        current: number,
        pageSize: number,
        pages: number,
        total: number
    }
    interface IWorkflow {
        "_id": string,
        "name": string,
        "version": number,
        "unit"?: {
            "name": string | null,
            "_id": string | null
        },
        "steps":
        {
            "order"?: number,
            "signers": [
                {
                    "unit"?: string | null,
                    "position"?: string | null
                }
            ]
        }[],
        "createdAt": string,
        "updatedAt": string
    }
    interface IPaginate<T> {
        meta: IMeta,
        result: T
    }
    interface IUnit {
        "_id": string,
        "name": string,
        "createdAt": string,
        "updatedAt": string
    }
}