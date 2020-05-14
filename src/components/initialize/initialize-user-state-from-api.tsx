import {useDispatch} from "react-redux";
import {getMe} from "../../api/user";
import {setUser} from "../../redux/user/actions";
import {LoginStatus, UserState} from "../../redux/user/types";
import React from "react";

const InitializeUserStateFromApi: React.FC = () => {
    const dispatch = useDispatch();
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

    return null;
}

export { InitializeUserStateFromApi }
