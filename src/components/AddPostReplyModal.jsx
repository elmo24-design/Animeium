import React, { useState, useEffect } from 'react'
import {motion} from 'framer-motion'
import { toast } from 'react-toastify'
//Firebase
import { getAuth } from 'firebase/auth'
import { 
   addDoc,
   getDoc,
   collection, 
   doc,
   updateDoc,
   serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase.config'

const backdropVariants = {
   hidden:{
      opacity: 0
   },
   visible: {
      opacity: 1
   }
}
const modal = {
   hidden: {
      y: "-100vh"
   },
   visible: {
      y: 0,
      opacity: 1,
      transition: {
         delay: 0.2
      }
   }
}

function AddPostReplyModal({ selectedComment, setSelectedComment, fetchPostReplies, post, postId }) {
   const [loading, setLoading] = useState(false)
   const [reply, setReply] = useState('')
   const [targetUser, setTargetUser] = useState(null)

   const auth = getAuth()

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setSelectedComment(null)
      }
   }

   const handleSubmit = async(e) =>{
      e.preventDefault()
      setLoading(true)
      try{
         await addDoc(collection(db, 'postReplies'), {
            reply: reply,
            userRef: auth.currentUser.uid,
            commentRef: selectedComment.id,
            postUserRef: post.userRef,
            createdAt: serverTimestamp()
         })

         if(selectedComment.data.userRef !== auth.currentUser.uid){
            const docRef = await addDoc(collection(db, 'notifications'), {
               content: "replied to your comment",
               className: 'notif',
               userRef: auth.currentUser.uid,
               targetRef: selectedComment.data.userRef,
               postRef: postId,
               createdAt: serverTimestamp()
            })  
   
            const targetDocRef = doc(db, 'users', selectedComment.data.userRef)
   
            await updateDoc(targetDocRef, {
               notifs: [ ...targetUser.notifs, docRef.id ]
            })
         }

         fetchPostReplies()
         setReply('')
         setSelectedComment(null)
         toast.success('Reply sent')
         setLoading(false)
      }catch(err){
         console.log(err)
         setLoading(false)
      }
   }

   const fetchTargetUser = async() => {
      const docRef = doc(db, 'users', selectedComment.data.userRef)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setTargetUser(docSnap.data())
      }
   }

   useEffect(() => {
      if(selectedComment){
         fetchTargetUser()
      }

      //eslint-disable-next-line
   }, [selectedComment]);

   return (
      <>
         <motion.div
            className="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            onClick={handleClick}
         >
            <motion.div className='modal reply-modal' variants={modal}>
               <form onSubmit={handleSubmit}>
                  <h3>Reply to Comment</h3>
                  <textarea
                     placeholder="Write your reply here..."
                     value={reply}
                     onChange={(e) => setReply(e.target.value)}
                     required
                  >
                     
                  </textarea>
                  {
                     loading ? 
                     <button type="submit" className="btn reply-modal-btn reply-modal-btn-loading" 
                     disabled="true"
                     >
                        Loading...
                     </button>
                     :
                     <button type="submit" className="btn reply-modal-btn">
                        Reply
                     </button>
                  }
               </form>
            </motion.div>
         </motion.div>   
      </>
   )
}

export default AddPostReplyModal