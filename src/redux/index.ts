import {combineReducers, Reducer} from 'redux';
import {UserState} from "./user/types";
import {UserReducer} from "./user/reducers";
import {ApplicationConfigReducer} from "./application-config/reducers";
import {ApplicationConfigState} from "./application-config/types";
import {ModalShowReducer} from "./modal/reducers";
import {ModalShowState} from "./modal/types";

export interface ApplicationState {
    user: UserState;
    modalShow: ModalShowState;
    applicationConfig: ApplicationConfigState;
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
    user: UserReducer,
    modalShow: ModalShowReducer,
    applicationConfig: ApplicationConfigReducer
});
