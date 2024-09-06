import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Define the structure of your user info here based on the JWT payload
interface UserInfo {
  id: string;
  email: string;
  // Add other properties as needed
}

// Define the structure of your root state
interface RootState {
  loading: boolean;
  userInfo: UserInfo | null;
}

// Function to safely decode token
const decodeToken = (token: string | null): UserInfo | null => {
  if (token) {
    try {
      return jwtDecode<UserInfo>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }
  return null;
};

// Initialize state
const initialState: RootState = {
  loading: true,
  userInfo: decodeToken(localStorage.getItem('token')),
};

// Create the slice
export const rootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload;
    },
  },
});

// Export actions and reducer
export const { setLoading, setUserInfo } = rootSlice.actions;
export default rootSlice.reducer;
