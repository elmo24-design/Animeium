import { useEffect, useState } from 'react'
import { 
   getDocs, 
   collection,
   query,
   orderBy
} from 'firebase/firestore'
import { db } from '../firebase.config'

export const usePostComments = () => {
   const [postComments, setPostComments] = useState(null)

   const fetchPostComments = async() => {
      try{
         const postCommentsRef = collection(db, 'postComments') 
     
         const q = query(postCommentsRef, 
           orderBy('createdAt', 'asc')
         )
       
         const querySnap = await getDocs(q)
 
         const postComments = []
 
         querySnap.forEach((doc) => {
            return postComments.push({
               id: doc.id,
               data: doc.data()
            })
         })
 
         setPostComments(postComments)
      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
     fetchPostComments()
     //eslint-disable-next-line
   }, [])

   return { postComments, setPostComments, fetchPostComments }
}