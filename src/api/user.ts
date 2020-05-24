import {expectResponseCode, getBackendUrl} from "../utils/apiUtils";

export const getMe = async () => {
    return fetch('/me');
}

export const postEmailLogin = async (email: string, password: string) => {
    const response = await fetch(getBackendUrl() + "/auth/email", {
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
    });

    expectResponseCode(response);
    return await response.json();
}

export const postLdapLogin = async (username: string, password: string) => {
    const response = await fetch(getBackendUrl() + "/auth/ldap", {
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
            username: username,
            password: password,
        })
    })

    expectResponseCode(response)
    return await response.json();
}

export const postOpenIdLogin = async (openId: string) => {
    const response = await fetch(getBackendUrl() + "/auth/openid", {
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
            openId: openId
        })
    })

    expectResponseCode(response)
    return await response.json();
}
