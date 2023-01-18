import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdDelete, MdEdit, MdOutlineRestore } from 'react-icons/md'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FaComment } from 'react-icons/fa'
// import moment from 'moment'
import FullSpinner from '../components/FullSpinner'
import { toast } from 'react-toastify'


import PostImageModal from './PostImageModal'
import EditPostModal from './EditPostModal'

//Firebase
import { 
   doc, 
   getDoc,
   updateDoc,
   deleteDoc,
   addDoc,
   collection,
   serverTimestamp,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
//Hooks
import { useAllUsers } from '../hooks/useAllUsers'
import { usePostComments } from '../hooks/usePostComments'
import { usePostReplies } from '../hooks/usePostReplies'

import '../pages/styles/Posts.scss'

function PostItem({ post, fetchPosts, group, archived }) {
   const [selectedPost, setSelectedPost] = useState(null)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [targetUser, setTargetUser] = useState(null)

   const { users } = useAllUsers() 
   const {postComments} = usePostComments()
   const {postReplies} = usePostReplies()

   const {format} = require('date-fns');

   const auth = getAuth()
   const [selectedURL, setSelectedURL] = useState(null)

   const deletePost = async() =>{
      if(window.confirm('Are you sure you want to permanently delete this post?')){
         setDeleteLoading(true)
         try{
            const docRef = doc(db, 'posts', post.id)
            await deleteDoc(docRef)

            
            await postComments.forEach(comment => {
               if(comment.data.postRef === post.id){
                  const docRef = doc(db, 'postComments', comment.id)
                  deleteDoc(docRef).then(() => {
                     postReplies.forEach(reply => {
                        if(reply.data.commentRef === comment.id){
                           const docRef = doc(db, 'postReplies', reply.id)
                           deleteDoc(docRef)
                        }
                     })
                  })
               }
            })

            toast.success('Post deleted successfully')
            setDeleteLoading(false)
         }catch(err){
            toast.error('Something went wrong')
            setDeleteLoading(false)
         }
      }
   }

   const archivePost = async() => {
      if(window.confirm('Are you sure you want to archive this post?')){
         setDeleteLoading(true)
         try{
            const docRef = doc(db, 'posts', post.id)

            await updateDoc(docRef, {
              isArchived: true,
              archiveUserRef: auth.currentUser.uid
            })

            toast.success('Post archived successfully')
            setDeleteLoading(false)
         }catch(err){
            toast.error('Something went wrong')
            setDeleteLoading(false)
         }
      }
   }

   const restorePost = async() => {
      if(window.confirm('Are you sure you want to restore this post?')){
         setDeleteLoading(true)
         try{
            const docRef = doc(db, 'posts', post.id)

            await updateDoc(docRef, {
              isArchived: false,
              archiveUserRef: ''
            })

            toast.success('Post restored successfully')
            setDeleteLoading(false)
         }catch(err){
            toast.error('Something went wrong')
            setDeleteLoading(false)
         }
      }
   }

   const likePost = async() => {
      const newLike = auth.currentUser.uid
      const docRef = doc(db, 'posts', post.id)

      await updateDoc(docRef, {
         likes: [ ...post.data.likes, newLike]
      })

      if(post.data.userRef !== auth.currentUser.uid){
         const docRef = await addDoc(collection(db, 'notifications'), {
            content: "liked your post",
            className: 'notif',
            userRef: auth.currentUser.uid,
            targetRef: post.data.userRef,
            postRef: post.id,
            createdAt: serverTimestamp()
         })  

         const targetDocRef = doc(db, 'users', post.data.userRef)

         await updateDoc(targetDocRef, {
            notifs: [ ...targetUser.notifs, docRef.id ]
         })
         
      }
   }

   const unlikePost = async() => {
      const newLikes = post.data.likes.filter(like => {
        return like !== auth.currentUser.uid
      })
      const docRef = doc(db, 'posts', post.id)

      await updateDoc(docRef, {
        likes: [...newLikes]
      })
   }

   useEffect(() => {
      const fetchTargetUser = async() => {
         const docRef = doc(db, 'users', post.data.userRef)
         const docSnap = await getDoc(docRef)

         if(docSnap.exists()){
            setTargetUser(docSnap.data())
         }
      }
      
      fetchTargetUser()

      //eslint-disable-next-line
   }, [])

   return (
      <>
         {
            selectedPost &&
            <EditPostModal 
               selectedPost={selectedPost.data}
               setSelectedPost={setSelectedPost}
               selectedId={selectedPost.id}
               fetchPosts={fetchPosts}
            />
         }
      
         {
            selectedURL &&
            <PostImageModal 
              selectedURL={selectedURL}
              setSelected={setSelectedURL}
            />
         }

          {
            deleteLoading &&
            <FullSpinner />
          }

         <div className="write-comment-div room-comment-div mb-1 post-item-bg">
            {
               users && users.map((user) => (
                  <div key={user.id}>
                     {
                        user.id === post.data.userRef ? 
                        <>
                           {
                              user.data.profilePhotoURL === '' ?
                              <div className="default-logo d-flex items-center justify-center">
                                 { user.data.name[0].toUpperCase() }
                              </div>
                              :
                              <div className="profile-container">
                                 <img 
                                    src={user.data.profilePhotoURL}
                                    alt="logo" 
                                    className='comment-logo'
                                 />
                              </div>  
                           }
                        </>
                        :
                        <></>
                     }
                  </div>
               ))
            }

            {/* second div  */}
            <div className="comment-body room-body">
               <div className="d-flex items-center justify-between">
                  <div className="comment-name">
                     {
                        users && users.map(user => (
                           <p key={user.id}>
                              {
                                 user.id === post.data.userRef ?
                                 <>
                                     <Link 
                                          to={
                                             user.id === auth.currentUser.uid ?
                                             `/profile`
                                             :
                                             `/people/${user.id}`
                                          } 
                                          className="decoration-none"
                                       >
                                       { user.data.name }
                                    </Link>
                                 </>
                                 :
                                 <></>
                              }
                           </p>
                        ))
                     }
                     {
                        post.data.createdAt &&
                        <small className='post-date'>{format(post.data.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                     }
                     
                  </div>
                 
                  <div className='d-flex items-center'>
                   
                    {
                      post.data.userRef === auth.currentUser.uid  || 
                      group.userRef === auth.currentUser.uid ?
                      <>
                        {
                          post.data.userRef === auth.currentUser.uid ?
                          <MdEdit className='edit-icon' onClick={() => setSelectedPost(post)} />
                          :
                          <></>
                        }
                        {
                          archived ?
                          <>
                            <MdOutlineRestore className='restore-icon ml-1' onClick={restorePost}/>
                            <MdDelete className='delete-icon' onClick={deletePost} />
                          </>
                          :
                          <MdDelete className='delete-icon' onClick={archivePost} />
                        }
                      </>
                      :
                      <></>
                    }
                  </div>
               </div>
               
               <div dangerouslySetInnerHTML={{__html: post.data.content}} className="mt-1 discussion-body-info" />

               {
                  post.data.imageURLS.length > 0 ?
                  <div className='mt-1'>
                     
                    <div className='discussion-img-wrapper'>
                      {
                        post.data.imageURLS.map((url, index) => (
                          <div key={index} className="discussion-img-container" onClick={() => setSelectedURL(url)}>
                            <img src={url} alt="attachment" />
                          </div>
                        ))
                      }
                    </div>
                     
                  </div>
                  :
                  <></>
               }
            </div>
         </div>

         <div>
            <div className="d-flex items-center justify-between width-full">
               <div className="blog-icons reply-icons width-full">
                  <div className="blog-icon heart-icon">
                     {
                        post.data.likes.includes(auth.currentUser.uid) ? 
                        <AiFillHeart onClick={() => unlikePost(post)}/>
                        :
                        <AiOutlineHeart onClick={() => likePost(post)} />
                     }                           
                     { post.data.likes.length }
                  </div>
                  <div className='blog-icon comment-icon'> 
                     <FaComment />
                     { post.data.comments.length }
                  </div>
               
                  <small className='text-primary cursor-pointer ml-auto'>
                    <Link to={`/home/post/${post.id}`} className="link-discussion">
                        View post
                    </Link>
                  </small>
               
               </div>
            </div>
         </div>
      </>
   )
}

export default PostItem