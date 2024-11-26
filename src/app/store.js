import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import messageReducer from "../features/messageSlice";
import calculateReducer from "../features/calculateSlice";
import coinShowReducer from "../features/calculateSlice";
import topUsersReducer from "../features/topUserSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        message: messageReducer,
        calculate: calculateReducer,
        coinShow: coinShowReducer,
        topUsers: topUsersReducer,
    },
});