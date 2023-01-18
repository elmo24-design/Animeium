import { useEffect, useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useAuthStatus } from './useAuthStatus'

export const useCurrentUser = () => {
   const [currentUser, setCurrentUser] = useState(null)
   const [loading, setLoading] = useState(true)

   const { userId } = useAuthStatus()

   const fetchUser = async () => {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if(docSnap.exists()){
         setCurrentUser(docSnap.data())
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchUser()
            
      //eslint-disable-next-line
   }, [userId])

   return { currentUser, loading, fetchUser }
}
