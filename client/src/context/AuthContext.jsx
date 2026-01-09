import axios from "axios";
import { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props)=>{

    axios.defaults.withCredentials = true;

    const backendUrl= import.meta.env.VITE_BACKEND_URL;

    const [loading , setloading]= useState(true)
    const [isLoggedIn , setIsLoggedIn]= useState(false);
    const [userData , setUserData]= useState(null);

    const getAuthState = async ()=>{
        try{
            const {data}= await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true);
                getUserData(); 
            }
        }catch(error){
            toast.error(error.message);
        }
        setloading(false);
    }

    const getUserData = async ()=>{
        try{
            const {data} = await axios.get(backendUrl + '/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message);
            setloading(false);
        }catch(error){
            toast.error(error.message)
        }
    }

    useEffect(() => {
    getAuthState();
  }, []);
  
    const value={
        backendUrl,
        isLoggedIn , setIsLoggedIn,
        userData , setUserData,
        getUserData
    }
    return (
        <AppContext.Provider value={value}>
            {!loading && props.children}
        </AppContext.Provider>
    )
}