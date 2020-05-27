import { createStore } from 'redux'
import { allReducers } from '../redux'

export const store = createStore(allReducers)
