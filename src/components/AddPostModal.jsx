import React, { useState } from 'react'
import {motion} from 'framer-motion'
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import ProgressBarUpload from './ProgressBarUpload'
//Firebase
import { getAuth } from 'firebase/auth'
import { 
   addDoc, 
   collection, 
   doc,
   updateDoc,
   serverTimestamp 
} from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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

function AddPostModal({ setAddModal, groupId, fetchPosts, group, targetUser }) {
   const [loading, setLoading] = useState(false)
   const [content, setContent] = useState("");
   const [images, setImages] = useState({});
   const [progress, setProgress] = useState(0)

   const auth = getAuth()

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setAddModal(false)
      }
   }

   const handleSubmit = async(e) => {
      e.preventDefault()
      setLoading(true)
      
      if(images.length > 4){
         setLoading(false)
         toast.error('Max 4 images')
         return
      }

      //Store image in firebase storage
      const storeImage = async(image) => {
         return new Promise((resolve, reject) => {
            const storage = getStorage()
            const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
            const filePath = `images/posts/attachments/${fileName}`

            const storageRef = ref(storage, filePath)
            const uploadTask = uploadBytesResumable(storageRef, image);

            uploadTask.on('state_changed', 
               (snapshot) => {
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
                  reject(error)
               }, 
               () => {
                  // get the download URL: https://firebasestorage.googleapis.com/...
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                     resolve(downloadURL) //This will return an image url
                  });
               }
            );
         })
      }

      let imageURLS

      if(images && images.length > 0){
         imageURLS = await Promise.all(
            [...images].map((image) => storeImage(image))
         ).catch(() => {
            setLoading(false)
            toast.error('Images not uploaded')
            return
         })
      }else{
         imageURLS = []
      }
   

      const docPostRef = await addDoc(collection(db, 'posts'), {
         content: content,
         imageURLS: imageURLS,
         groupRef: groupId,
         userRef: auth.currentUser.uid,
         archiveUserRef: '',
         groupUserRef: group.userRef,
         likes: [],
         comments: [],
         isArchived: false,
         createdAt: serverTimestamp()
      })

      if(group.userRef !== auth.currentUser.uid){
         const docRef = await addDoc(collection(db, 'notifications'), {
            content: `created a new post on the group you created (${group.groupName})`,
            className: 'notif',
            userRef: auth.currentUser.uid,
            targetRef: group.userRef,
            postRef: docPostRef.id,
            createdAt: serverTimestamp()
         })  

         const targetDocRef = doc(db, 'users', group.userRef)

         await updateDoc(targetDocRef, {
            notifs: [ ...targetUser.notifs, docRef.id ]
         })
      }

      fetchPosts()
      setLoading(false)
      toast.success('Post created successfully')
      setAddModal(false)
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
            <motion.div className='modal add-post-modal' variants={modal}>
               <form onSubmit={handleSubmit}>
                  <h3>Create a post</h3>
                  <div className="auth-form-group">
                     <label>Share something...</label>
                     <Editor
                        required
                        textareaName='Body'
                        apiKey="mk5gii470zw4lvwdjku5t18txtluqp47s501kpqrea6acvtu"
                        init={{
                           height: 300,
                           menubar: false,
                           plugins: [
                           'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                           'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                           'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                           ],
                           toolbar: 'undo redo | blocks | ' +
                           'bold italic forecolor | alignleft aligncenter ' +
                           'alignright alignjustify | bullist numlist outdent indent | ' +
                           'removeformat | help',
                           content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                        onEditorChange={(newText) => setContent(newText)}
                     />
                  </div>

                  <div className="auth-form-group mb-1">
                     <label htmlFor="image" className='file-label'>Add attachments (optional) <span><small>Max. of 4 images</small></span></label>
                     <input
                        className='formInputFile'
                        type='file'
                        id='image'
                        onChange={(e) => setImages(e.target.files)}
                        accept='.jpg,.png,.jpeg'
                        max='4'
                        multiple 
                     />
                  </div>

                  {
                     loading ? 
                     <button type="submit" className="btn reply-modal-btn reply-modal-btn-loading" 
                     disabled="true"
                     >
                        Posting...
                     </button>
                     :
                     <button type="submit" className="btn reply-modal-btn">
                        Post
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

export default AddPostModal