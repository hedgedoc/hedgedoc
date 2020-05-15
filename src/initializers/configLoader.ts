import {getBackendConfig, getFrontendConfig} from "../api/config";
import {setFrontendConfig} from "../redux/frontend-config/methods";
import {setBackendConfig} from "../redux/backend-config/methods";
import {getAndSetUser} from "../utils/apiUtils";

export function loadAllConfig() {
    return getFrontendConfig()
        .then((frontendConfig) => {
            if (!frontendConfig) {
                return Promise.reject("Frontend config empty!");
            }
            setFrontendConfig(frontendConfig);
            return getBackendConfig()
        })
        .then((backendConfig) => {
            if (!backendConfig) {
                return Promise.reject("Backend config empty!");
            }
            setBackendConfig(backendConfig)
        }).then(() => {
            getAndSetUser();
        })
}

