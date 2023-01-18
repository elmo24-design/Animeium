import React, { useState } from 'react'
import {motion} from 'framer-motion'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import ProgressBarUpload from './ProgressBarUpload'
//Firebase
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from 'firebase/firestore'
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

function EditGroupCoverModal({ groupId, setSelectedGroup, fetchGroup }) {
   const [loading, setLoading] = useState(false)
   const [image, setImage] = useState("")
   const [progress, setProgress] = useState(0)

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setSelectedGroup(null)
      }
   }

   const handleSubmit = async(e) =>{
      e.preventDefault()
      try{
         //Storage
         const storage = getStorage()
         const fileName = `${image.name}-${uuidv4()}`
         const filePath = `images/groups/coverPhotos/${fileName}`

         const storageRef = ref(storage, filePath)
         const uploadTask = uploadBytesResumable(storageRef, image);

         uploadTask.on('state_changed', 
         (snapshot) => {
            setLoading(true)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            setProgress(progress)
            switch (snapshot.state) {
               case 'paused':
                  console.log('Upload is paused');
                  break;
               case 'running':
                  console.log('Upload is running');
                  break;
               default:
                  break;
            }
         }, 
         (error) => {
            console.log(error)
         }, 
         async() => {
            // get the download URL: https://firebasestorage.googleapis.com/...
            await getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
               
               const docRef = doc(db, 'groups', groupId)
               await updateDoc(docRef, {
                  coverPhotoURL: downloadURL
               })
               
               fetchGroup()
               setSelectedGroup(null)
               toast.success('Cover Photo Updated')
               setLoading(false)                 
            });
         });
         //End of image upload
         
      }catch(err){
         console.log(err)
         toast.error('Something went wrong')
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
            <motion.div className='modal file-modal' variants={modal}>
               <form onSubmit={handleSubmit}>
                  <h3>Change Cover Photo</h3>
                  <div className="auth-form-group mb-1">
                     <label htmlFor="image" className='file-label'>Cover Photo</label>
                     <input
                        className='formInputFile'
                        type='file'
                        id='image'
                        onChange={(e) => setImage(e.target.files[0])}
                        accept='.jpg,.png,.jpeg'
                        required
                     />
                  </div>
                  {
                     loading ? 
                     <button type="submit" className="btn reply-modal-btn reply-modal-btn-loading" 
                     disabled="true"
                     >
                        Uploading...
                     </button>
                     :
                     <button type="submit" className="btn reply-modal-btn">
                        Upload
                     </button>
                  }
                   {
                     loading &&
                     <div className='pb-1'>
                        <ProgressBarUpload progress={progress}/>
                     </div>
                  }
               </form>
            </motion.div>
         </motion.div>   
      </>
   )
}

export default EditGroupCoverModal