import {createStore} from 'redux';
import {allReducers} from '../index';
import {Provider} from "react-redux";
import React, {ReactNode} from "react";

interface JustChildrenProps {
    children: ReactNode;
}

export const ApplicationStateStoreProvider: React.FC<JustChildrenProps> = (props: JustChildrenProps) => {
    const store = createStore(allReducers);
    return <Provider store={store}>{props.children}</Provider>;
}