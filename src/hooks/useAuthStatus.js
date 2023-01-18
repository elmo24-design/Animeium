import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatus = () => {
   const [loggedIn, setLoggedIn] = useState(false)
   const [checkingStatus, setCheckingStatus] = useState(true)
   const [userId, setUserId] = useState(null)

   useEffect(() => {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
         if(user && user.emailVerified){
            setLoggedIn(true)
            setUserId(user.uid)
         }
         setCheckingStatus(false)
      })
   }, [])

   return { loggedIn, checkingStatus, userId }
}
