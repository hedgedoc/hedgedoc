import {getMe} from "../api/user";
import {LoginStatus} from "../redux/user/types";
import {setUser} from "../redux/user/methods";
import {store} from "./store";

export const getAndSetUser = async () => {
    const meResponse = await getMe();
    expectResponseCode(meResponse);
    const me = await meResponse.json();
    if (!me) {
        return;
    }
    setUser({
        status: LoginStatus.ok,
        id: me.id,
        name: me.name,
        photo: me.photo,
    });
}

export const getBackendUrl = () => {
    return store.getState().frontendConfig.backendUrl;
}

export const expectResponseCode = (response: Response, code: number = 200) => {
    return (response.status !== code);
}