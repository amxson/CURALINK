import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers/rootSlice';

// Define the RootState type from the rootReducer
export type RootState = ReturnType<typeof store.getState>;

// Define the AppDispatch type
export type AppDispatch = typeof store.dispatch;

const store = configureStore({
  reducer: {
    root: rootReducer,
  },
});

// Export the store itself
export default store;
