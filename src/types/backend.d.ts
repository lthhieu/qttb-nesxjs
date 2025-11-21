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
        p12: string,
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
    interface IUserInfo {
        "user": {
            "_id": string,
            "name": string
        },
        "unit"?: {
            "_id"?: string,
            "name"?: string
        },
        "position"?: {
            "_id"?: string,
            "name"?: string
        }
    }
    interface IDocument {
        "_id": string,
        "name": string,
        "author": IUserInfo,
        "workflow": string,
        "cur_version": number,
        "cur_status": string,
        "cur_link": string,
        "info": [
            {
                "version": number,
                "link": string,
                "singers": IUserInfo[]
            }
        ],
        "createdAt": string,
        "updatedAt": string
    }
    interface IFile {
        filename: string,
        folder: string,
        link: string
    }
}