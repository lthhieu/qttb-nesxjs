
export { }

declare global {
    interface ISession {
        access_token: string,
        refresh_token: string
    }
}