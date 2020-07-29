import { Reducer } from 'redux'
import { ApiUrlActions, ApiUrlActionType, ApiUrlObject, SetApiUrlAction } from './types'

export const initialState: ApiUrlObject = {
  apiUrl: ''
}

export const ApiUrlReducer: Reducer<ApiUrlObject, ApiUrlActions> = (state: ApiUrlObject = initialState, action: ApiUrlActions) => {
  switch (action.type) {
    case ApiUrlActionType.SET_API_URL:
      return (action as SetApiUrlAction).state
    default:
      return state
  }
}
