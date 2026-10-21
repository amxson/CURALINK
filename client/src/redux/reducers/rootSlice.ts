import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";

// Define the structure of your user info here based on the JWT payload
interface UserInfo {
  _id: string;  // Changed from 'id' to '_id' to match your component logic
  id?: string;   // Keeping 'id' as optional just in case
  email: string;
  role: string;  // Added role
}

// OPD appointment type
export interface Appointment {
  _id: string;
  opdType?: string;
  roomNumber?: string;
  doctorId: {
    _id: string;
    firstname: string;
    lastname: string;
    pic: string;
  };
  userId: {
    firstname: string;
    lastname: string;
    pic: string;
  };
  date: string;
  status: string;
}

// Lab order type
export interface LabOrder {
  _id: string;
  testName: string;
  category: string;
  status: string;
  patientId: any;
  doctorId: any;
  createdAt: string;
}

// Root state
interface RootState {
  loading: boolean;
  userInfo: UserInfo | null;

  opdAppointments: Appointment[];
  opdLoading: boolean;

  labOrders: LabOrder[];     // ✅ added
  labLoading: boolean;       // ✅ added
}

const decodeToken = (token: string | null): UserInfo | null => {
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    // DEBUG: This will show you the payload in the browser console
    console.log("Token Payload discovered:", decoded);

    return {
      // FIX: Map 'userId' from your payload to '_id' for the app
      _id: decoded.userId || decoded._id || "",
      email: decoded.email || "", // Note: If email is missing from payload, it will be empty
      role: decoded.role || "Patient",
    };
  } catch (error) {
    return null;
  }
};

// Initial state
const initialState: RootState = {
  loading: false, // Changed to false by default to prevent "stuck" state
  userInfo: decodeToken(localStorage.getItem("token")),
  opdAppointments: [],
  opdLoading: false,
  labOrders: [],
  labLoading: false,
};

// Slice
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

    // OPD
    setOpdAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.opdAppointments = action.payload;
    },

    setOpdLoading: (state, action: PayloadAction<boolean>) => {
      state.opdLoading = action.payload;
    },

    // Lab
    setLabOrders: (state, action: PayloadAction<LabOrder[]>) => {
      state.labOrders = action.payload;
    },

    setLabLoading: (state, action: PayloadAction<boolean>) => {
      state.labLoading = action.payload;
    },
  },
});

// Export actions
export const {
  setLoading,
  setUserInfo,
  setOpdAppointments,
  setOpdLoading,
  setLabOrders,      // ✅ exported
  setLabLoading,     // ✅ exported
} = rootSlice.actions;

export default rootSlice.reducer;
