import { useEffect, useState } from 'react'
import { 
   getDocs, 
   collection,
   query,
   orderBy
} from 'firebase/firestore'
import { db } from '../firebase.config'

export const useAllUsers = () => {
   const [users, setUsers] = useState(null)
   const [loading, setLoading] = useState(false)

   const fetchUsers = async() => {
      setLoading(true)
      try{
         const usersRef = collection(db, 'users') 
     
         const q = query(usersRef,
           orderBy('createdAt', 'desc')
         )
       
         const querySnap = await getDocs(q)
 
         const users = []
 
         querySnap.forEach((doc) => {
            return users.push({
               id: doc.id,
               data: doc.data()
            })
         })
 
         setUsers(users)
         setLoading(false)
      }catch(err){
         console.log(err)
         setLoading(false)
      }
   }

   useEffect(() => {
     fetchUsers()
     //eslint-disable-next-line
   }, [])

   return { users, loading, fetchUsers }
}
