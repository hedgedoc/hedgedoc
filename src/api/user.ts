import {expectResponseCode, getBackendUrl} from "../utils/apiUtils";

export const getMe = async () => {
    return fetch('/me');
}

export const postEmailLogin = async (email: string, password: string) => {
    return fetch(getBackendUrl() + "/login", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            email: email,
            password: password,
        })
    })
        .then(expectResponseCode())
        .then(response => response.json());
}