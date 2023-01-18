import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

import PostComments from '../components/PostComments'
import PostImageModal from '../components/PostImageModal'
import EditPostModal from '../components/EditPostModal'
import Spinner from '../components/Spinner'
import FullSpinner from '../components/FullSpinner'
import { toast } from 'react-toastify'
import { BiArrowBack } from 'react-icons/bi'
import { MdEdit, MdDelete, MdOutlineRestore } from 'react-icons/md'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { IoMdSend } from 'react-icons/io'
import { FaComment } from 'react-icons/fa'
// import moment from 'moment'

import { useAllUsers } from '../hooks/useAllUsers'
import { useCurrentUser } from '../hooks/useCurrentUser'
//Firebase
import { 
   getDoc, 
   getDocs, 
   doc, 
   addDoc,
   updateDoc,
   deleteDoc,
   collection,
   serverTimestamp,
   query,
   where ,
   orderBy
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'

import { usePostReplies } from '../hooks/usePostReplies'

import './styles/Group.scss'
import './styles/Profile.scss'


function Post() {
   const {format} = require('date-fns');

   const [post, setPost] = useState(null)
   const [comment, setComment] = useState('')
   const [comments, setComments] = useState(null)
   const [targetUser, setTargetUser] = useState(null)

   const [selectedURL, setSelectedURL] = useState(null)

   const [loading, setLoading] = useState(true)
   const [submitLoading, setSubmitLoading] = useState(false)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [commentsloading, setCommentsLoading] = useState(false)

   const [selectedPost, setSelectedPost] = useState(null)
   const { users } = useAllUsers() 
   const { currentUser } = useCurrentUser()
   const { postReplies } = usePostReplies()

   const navigate = useNavigate()
   const { postId } = useParams()

   const auth = getAuth()

   const fetchPost = async() => {
      const docRef = doc(db, 'posts', postId)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setPost(docSnap.data())
         setLoading(false)
      }else{
         navigate('/home')
         toast.error('Post does not exist')
      }
   }

   const fetchComments = async() => {
      try{
         const commentsRef = collection(db, 'postComments') 
     
         const q = query(commentsRef, 
           where('postRef', '==', postId),
           orderBy('createdAt', 'asc')
         )
       
         const querySnap = await getDocs(q)
 
         const comments = []
 
         querySnap.forEach((doc) => {
           
            return comments.push({
               id: doc.id,
               data: doc.data()
            })
            
         })
 
         setComments(comments)
         setCommentsLoading(false)
      }catch(err){
         console.log(err)
      }
   }

   const likePost = async() => {
      const newLike = auth.currentUser.uid
      const docRef = doc(db, 'posts', postId)

      await updateDoc(docRef, {
         likes: [ ...post.likes, newLike]
      })

      if(post.userRef !== auth.currentUser.uid){
         const docRef = await addDoc(collection(db, 'notifications'), {
            content: "liked your post",
            className: 'notif',
            userRef: auth.currentUser.uid,
            targetRef: post.userRef,
            postRef: postId,
            createdAt: serverTimestamp()
         })  

         const targetDocRef = doc(db, 'users', post.userRef)

         await updateDoc(targetDocRef, {
            notifs: [ ...targetUser.notifs, docRef.id ]
         })
         
      }

      fetchPost()
   }

   const unlikePost = async() => {
      const newLikes = post.likes.filter(like => {
        return like !== auth.currentUser.uid
      })
      const docRef = doc(db, 'posts', postId)

      await updateDoc(docRef, {
        likes: [...newLikes]
      })

      fetchPost()
   }

   const deletePost = async() =>{
      if(window.confirm('Are you sure you want to permanently delete this post?')){
         setDeleteLoading(true)
         try{
            const docRef = doc(db, 'posts', postId)
            await deleteDoc(docRef)

            await comments.forEach(comment => {
               const docRef = doc(db, 'postComments', comment.id)
               deleteDoc(docRef).then(() => {
                  postReplies.forEach(reply => {
                     if(reply.data.commentRef === comment.id){
                        const docRef = doc(db, 'postReplies', reply.id)
                        deleteDoc(docRef)
                     }
                  })
               })
            })

            navigate(-1)
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
            const docRef = doc(db, 'posts', postId)

            await updateDoc(docRef, {
               isArchived: true,
               archiveUserRef: auth.currentUser.uid
            })
            
            navigate(-1)
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
            const docRef = doc(db, 'posts', postId)

            await updateDoc(docRef, {
               isArchived: false,
               archiveUserRef: ''
            })

            navigate(-1)
            toast.success('Post restored successfully')
            setDeleteLoading(false)
         }catch(err){
            toast.error('Something went wrong')
            setDeleteLoading(false)
         }
      }
   }

   const submitComment = async(e) =>{
      e.preventDefault()
      setSubmitLoading(true)
      try{
         const commentRef = await addDoc(collection(db, 'postComments'), {
            comment: comment,
            userRef: auth.currentUser.uid,
            postRef: postId,
            postUserRef: post.userRef,
            likes: [],
            createdAt: serverTimestamp()
         })

         const newComment = commentRef.id
         const docRef = doc(db, 'posts', postId)
   
         await updateDoc(docRef, {
            comments: [ ...post.comments, newComment]
         })

         if(post.userRef !== auth.currentUser.uid){
            const docRef = await addDoc(collection(db, 'notifications'), {
               content: "commented on your post",
               className: 'notif',
               userRef: auth.currentUser.uid,
               targetRef: post.userRef,
               postRef: postId,
               createdAt: serverTimestamp()
            })  
   
            const targetDocRef = doc(db, 'users', post.userRef)
   
            await updateDoc(targetDocRef, {
               notifs: [ ...targetUser.notifs, docRef.id ]
            })
         }

         fetchComments()
         fetchPost()

         setComment('')
         toast.success('Comment created')
         setSubmitLoading(false)


      }catch(err){
         console.log(err)
         setSubmitLoading(false)
      }
   }

   const fetchTargetUser = async() => {
      const docRef = doc(db, 'users', post.userRef)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setTargetUser(docSnap.data())
      }
   }

   
   useEffect(() => {

      fetchPost()
      fetchComments()

      if(post){
         fetchTargetUser()
      }
   
      //eslint-disable-next-line
   }, [postId, post]);


   useEffect(() => {
      // 👇️ scroll to top on page load
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
   }, []);
 


   return (
      <>
         {
            selectedPost &&
            <EditPostModal 
               selectedPost={selectedPost}
               setSelectedPost={setSelectedPost}
               selectedId={postId}
               fetchPosts={fetchPost}
            />
         }
         {
            deleteLoading &&
            <FullSpinner />
         }
         {
            submitLoading &&
            <FullSpinner />
         }
         {
            selectedURL &&
            <PostImageModal 
               selectedURL={selectedURL}
               setSelected={setSelectedURL}
            />
         }
         <div className="container pb-10">
            <Navbar />

            {
               post && !loading ?
               <>
                  
                  <div className='back cursor-pointer font-bold mb-2' onClick={() => navigate(-1)}>
                     <BiArrowBack />
                     Post
                  </div>
            
                  <div className="write-comment-div discussion-div mb-1 mt-1">
                     {
                        users && users.map((user) => (
                           <div key={user.id}>
                              {
                                 user.id === post.userRef ? 
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
                                          user.id === post.userRef ?
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
                              {/* <small className="room-date">{moment(post.createdAt.toDate()).startOf('hour').fromNow()}</small> */}
                              <small>{format(post.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                           </div>
                           
                           <div className='d-flex items-center'>
                              {
                                 post.userRef === auth.currentUser.uid || 
                                 post.groupUserRef === auth.currentUser.uid ?
                                 <>
                                    {
                                       post.userRef === auth.currentUser.uid &&
                                       post.isArchived === false ?
                                       <MdEdit className='edit-icon' onClick={() => setSelectedPost(post)}/>
                                       :
                                       <></>
                                    }
                                    {
                                       post.isArchived &&
                                       <MdOutlineRestore className='restore-icon' onClick={restorePost}/>
                                    }
                                   
                                    <MdDelete className='delete-icon' onClick={() => {
                                       if(post.isArchived){
                                          deletePost()
                                       }else{
                                          archivePost()
                                       }
                                    }}/>
                                         
                                 </>
                                 :
                                 <></>
                              }
                           </div>
                        </div>
                        
                        <div dangerouslySetInnerHTML={{__html: post.content}} className="mt-1 discussion-body-info" />

                        {
                           post.imageURLS.length > 0 ?
                           <div className='mt-1'>
                              <div className='discussion-img-wrapper'>
                                 {
                                    post.imageURLS.map((url, index) => (
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
                  
                  <div className="d-flex items-center justify-between width-full disc-icons">
                     <div className="blog-icons reply-icons width-full">
                        <div className="blog-icon heart-icon">
                           {
                              post.likes.includes(auth.currentUser.uid) ? 
                              <AiFillHeart onClick={() => unlikePost(post)}/>
                              :
                              <AiOutlineHeart onClick={() => likePost(post)} />
                           }                           
                           { post.likes.length }
                        </div>
                        <div className='blog-icon comment-icon'> 
                           <FaComment />
                           { post.comments.length }
                        </div>
                     </div>
                  </div>

                  <div className='mt-1 comments-div'>
                     <h4>Comments</h4>

                     <div>
                        {
                           comments && !commentsloading ?
                           <div className='mt-2'>
                              <PostComments 
                                 comments={comments}
                                 setComments={setComments}
                                 fetchComments={fetchComments}
                                 post={post}
                                 postId={postId}
                                 fetchPost={fetchPost}
                              />
                           </div>
                           :
                           <Spinner />
                        }
                     </div>

                     {/* Write Comment Section  */}

                     <div className="write-comment-div mt-2 post-item-bg">
                        {
                           currentUser &&
                           <>
                              {
                                 currentUser.profilePhotoURL === '' ?
                                 <div className="default-logo d-flex items-center justify-center">
                                    { currentUser.name[0].toUpperCase() }
                                 </div>
                                 :
                                 <div className="profile-container">
                                    <img 
                                       src={currentUser.profilePhotoURL}
                                       alt="logo" 
                                       className='comment-logo'
                                    />
                                 </div>
                              }
                           </>
                        }
                       
                        {/* second div  */}
                        <form onSubmit={submitComment}>
                           <textarea 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              cols="30" 
                              rows="5"
                              placeholder='Write your comment here...'
                              required
                              >
                           </textarea>
                           {
                              submitLoading ?
                              <button disabled="true" className='send-btn send-btn-disabled'>
                                 <IoMdSend
                                    type='submit'
                                 />
                              </button>
                              :
                              <button type="submit" className='send-btn'>
                                 <IoMdSend
                                    type='submit'
                                 />
                              </button>
                           }
                           
                        </form>
                     </div>
                  </div>
               </>
               :
               <Spinner />
            }
         </div>
      </>
   )
}

export default Post