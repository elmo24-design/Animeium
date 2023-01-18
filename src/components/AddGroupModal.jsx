import React, { useState } from 'react'
import {motion} from 'framer-motion'
import { toast } from 'react-toastify'
//Firebase
import { getAuth } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'

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

function AddGroupModal({ setRoomModal }) {
   const [loading, setLoading] = useState(false)

   const [groupName, setGroupName] = useState("")
   const [status, setStatus] = useState("")

   const auth = getAuth()
   const navigate = useNavigate()

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setRoomModal(false)
      }
   }

   const handleSubmit = async(e) =>{
      e.preventDefault()
      setLoading(true)
      try{
         const docRef = await addDoc(collection(db, 'groups'), {
            groupName: groupName,
            userRef: auth.currentUser.uid,
            archiveUserRef: '',
            members: [auth.currentUser.uid],
            joinRequests: [],         
            coverPhotoURL: '',
            logoURL: '',
            isArchived: false,
            status: status,
            createdAt: serverTimestamp()
         })

         navigate(`/home/${docRef.id}`)
         setRoomModal(false)
         toast.success('Group created successfully')
         setLoading(false)
      }catch(err){
         console.log(err)
         setLoading(false)
      }
   }

   return (
      <>
         <motion.div
            className="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            onClick={handleClick}
         >
            <motion.div className='modal reply-modal add-room-modal' variants={modal}>
               <form onSubmit={handleSubmit}>
                  <h3>Create a group</h3>
                  <div className="auth-form-group">
                     <label htmlFor="roomName">Group Name</label>
                     <input 
                        type="groupName" 
                        name="groupName" 
                        id="groupName" 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                     />
                  </div>

                  <div className="auth-form-group">
                     <label htmlFor="status">Status</label>
                     <select name="status" id="status"  value={status} onChange={(e) => setStatus(e.target.value)} required >
                        <option value="" disabled selected>Select Status</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                     </select>
                  </div>

                  {
                     loading ? 
                     <button type="submit" className="btn reply-modal-btn reply-modal-btn-loading" 
                     disabled="true"
                     >
                        Loading...
                     </button>
                     :
                     <button type="submit" className="btn reply-modal-btn">
                        Create
                     </button>
                  }
               </form>
            </motion.div>
         </motion.div>   
      </>
   )
}

export default AddGroupModal