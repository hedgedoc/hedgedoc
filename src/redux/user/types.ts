export interface UserState {
    status: LoginStatus;
    id: string;
    name: string;
    photo: string;
}

export enum LoginStatus {
    forbidden = "forbidden",
    ok = "ok"
}