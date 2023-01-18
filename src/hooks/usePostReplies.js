import { useEffect, useState } from 'react'
import { 
   getDocs, 
   collection,
   query,
   orderBy
} from 'firebase/firestore'
import { db } from '../firebase.config'

export const usePostReplies = () => {
   const [postReplies, setPostReplies] = useState(null)

   const fetchPostReplies = async() => {
      try{
         const postRepliesRef = collection(db, 'postReplies') 
     
         const q = query(postRepliesRef, 
           orderBy('createdAt', 'asc')
         )
       
         const querySnap = await getDocs(q)
 
         const postReplies = []
 
         querySnap.forEach((doc) => {
            return postReplies.push({
               id: doc.id,
               data: doc.data()
            })
         })
 
         setPostReplies(postReplies)
      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
     fetchPostReplies()
     //eslint-disable-next-line
   }, [])

   return { postReplies, setPostReplies, fetchPostReplies }
}