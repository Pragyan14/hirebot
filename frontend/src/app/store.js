import {configureStore, combineReducers} from "@reduxjs/toolkit"
import candidateReducer from "../slice/candidateSlice";
import qnaReducer from "../slice/qnaSlice";
import interviewResultReducer from "../slice/interviewResultsSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["candidate","qna", "interviewResults"],
};

const reducer = combineReducers({
  candidate: candidateReducer,
  qna: qnaReducer,
  interviewResults: interviewResultReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer
})

export default store;