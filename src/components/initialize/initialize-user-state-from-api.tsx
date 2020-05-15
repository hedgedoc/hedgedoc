import {useDispatch} from "react-redux";
import {getMe} from "../../api/user";
import {setUser} from "../../redux/user/actions";
import {LoginStatus, UserState} from "../../redux/user/types";
import React from "react";
import {Dispatch} from "redux";

export const getAndSetUser = (dispatch: Dispatch<any>) => {
    getMe()
        .then((me) => {
            if (me.status === 200) {
                return (me.json() as Promise<UserState>);
            }
        })
        .then(user => {
            if (!user) {
                return;
            }
            dispatch(setUser({
                status: LoginStatus.ok,
                id: user.id,
                name: user.name,
                photo: user.photo,
            }));
        });
}

const InitializeUserStateFromApi: React.FC = () => {
    const dispatch = useDispatch();
    getAndSetUser(dispatch);

    return null;
}

export { InitializeUserStateFromApi }
