import { Navigate, Outlet } from "react-router-dom"
import { useAuthStatus } from "../hooks/useAuthStatus"
import FullSpinner from "./FullSpinner"

const PrivateRoute = () => {
   const { loggedIn, checkingStatus } = useAuthStatus()

   if(checkingStatus){
      return <FullSpinner />
   }

   return loggedIn ? <Outlet /> : <Navigate to="/" />
}

export default PrivateRoute