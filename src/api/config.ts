import {FrontendConfigState} from "../redux/frontend-config/types";
import {BackendConfigState} from "../redux/backend-config/types";
import {expectResponseCode, getBackendUrl} from "../utils/apiUtils";

export const getBackendConfig = async () => {
    return fetch(getBackendUrl() + '/backend-config.json')
        .then(expectResponseCode())
        .then(response => response.json() as Promise<BackendConfigState>);
}

export const getFrontendConfig = async () => {
    return fetch('config.json')
        .then(expectResponseCode())
        .then(response => response.json() as Promise<FrontendConfigState>);
}