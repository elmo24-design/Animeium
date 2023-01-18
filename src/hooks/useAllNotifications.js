import { useEffect, useState } from 'react'
import { 
   collection,
   query,
   orderBy,
   where,
   onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { useAuthStatus } from './useAuthStatus'
// import { getAuth } from 'firebase/auth'

export const useAllNotifications = () => {
   const [ notifications, setNotifications] = useState(null)
   const [ loading, setLoading] = useState(true)

   // const auth = getAuth()
   const { userId } = useAuthStatus()

   const fetchNotifications = async() =>{
      try{
         const notifsRef = collection(db, 'notifications') 
      
         const q = query(notifsRef,
            where('targetRef', '==', userId),
            orderBy('createdAt', 'desc')
         )
        
         onSnapshot(q, (snap) => {
            const notifs = []
            snap.forEach((doc) => {
               return notifs.push({
                  id: doc.id,
                  data: doc.data()
               })
            })
            setNotifications(notifs)
            setLoading(false)
         })

      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
      fetchNotifications()

      //eslint-disable-next-line
   }, [userId])


   return { notifications, loading, fetchNotifications }
}