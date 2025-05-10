import axios from "axios";

// For split deployment on Render
// In development: use localhost
// In production: use the specific backend API URL
export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" 
		? "http://localhost:5500/api/v1" 
		: "https://pro-connect.onrender.com/api/v1",
	withCredentials: true,
});
