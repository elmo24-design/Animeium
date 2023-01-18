import { useEffect, useState } from 'react'
import { 
   collection,
   query,
   orderBy,
   getDocs,
   where
} from 'firebase/firestore'
import { db } from '../firebase.config'

export const useAllGroups = () => {
   const [ groups, setGroups] = useState(null)
   const [ loading, setLoading] = useState(true)

   const fetchGroups = async() =>{
      try{
         const groupsRef = collection(db, 'groups') 
      
         const q = query(groupsRef,
            where('isArchived', '==', false),
            orderBy('createdAt', 'desc')
         )
      
         const querySnap = await getDocs(q)

         const groups = []

         querySnap.forEach((doc) => {
            return groups.push({
               id: doc.id,
               data: doc.data()
            })
         })

         setGroups(groups)
         setLoading(false)
        
         // onSnapshot(q, (snap) => {
         //    const groups = []
         //    snap.forEach((doc) => {
         //       return groups.push({
         //          id: doc.id,
         //          data: doc.data()
         //       })
         //    })
         //    setGroups(groups)
         //    setLoading(false)
         // })

      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
      fetchGroups()

      //eslint-disable-next-line
   }, [])


   return { groups, loading, fetchGroups }
}