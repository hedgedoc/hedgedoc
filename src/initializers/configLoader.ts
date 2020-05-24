import {getBackendConfig, getFrontendConfig} from "../api/config";
import {setFrontendConfig} from "../redux/frontend-config/methods";
import {setBackendConfig} from "../redux/backend-config/methods";
import {getAndSetUser} from "../utils/apiUtils";

export async function loadAllConfig() {
    const frontendConfig = await getFrontendConfig();
    if (!frontendConfig) {
        return Promise.reject("Frontend config empty!");
    }
    setFrontendConfig(frontendConfig);

    const backendConfig = await getBackendConfig()
    if (!backendConfig) {
        return Promise.reject("Backend config empty!");
    }
    setBackendConfig(backendConfig)

    await getAndSetUser();
}