import { getAuth } from 'firebase/auth'
import { MdDelete } from 'react-icons/md'
import { useAllUsers } from '../hooks/useAllUsers'
// import moment from 'moment'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import PostReplies from './PostReplies'
import AddPostReplyModal from './AddPostReplyModal'
import { usePostReplies } from '../hooks/usePostReplies'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import FullSpinner from './FullSpinner'

import {
   doc, 
   updateDoc,
   deleteDoc,
   addDoc,
   collection,
   getDoc,
   serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { useState } from 'react'

function PostComments({ comments, setComments, fetchComments, postId, post, fetchPost, targetUser }) {
   const auth = getAuth()
   const { users } = useAllUsers()
   const { postReplies, setPostReplies, fetchPostReplies} = usePostReplies()

   const [ commentLoading, setCommentLoading] = useState(false)

   const [selectedComment, setSelectedComment] = useState(null)

   const {format} = require('date-fns');

   const likeComment = async(comment, targetCommentUser) => {
      const newLike = auth.currentUser.uid
      const docRef = doc(db, 'postComments', comment.id)

      await updateDoc(docRef, {
         likes: [ ...comment.data.likes, newLike]
      })

      if(comment.data.userRef !== auth.currentUser.uid){
         const docRef = await addDoc(collection(db, 'notifications'), {
            content: "liked your comment",
            className: 'notif',
            userRef: auth.currentUser.uid,
            targetRef: comment.data.userRef,
            postRef: postId,
            createdAt: serverTimestamp()
         })  

         const targetDocRef = doc(db, 'users', comment.data.userRef)

         await updateDoc(targetDocRef, {
            notifs: [ ...targetCommentUser.notifs, docRef.id ]
         })
         
      }

      fetchComments()
   }

   const unlikeComment = async(comment) => {
      const newLikes = comment.data.likes.filter(like => {
         return like !== auth.currentUser.uid
      })
      const docRef = doc(db, 'postComments', comment.id)

      await updateDoc(docRef, {
         likes: [...newLikes]
      })

      fetchComments()
   }

   const deleteComment = async(id) => {
      if(window.confirm('Are you sure you want to delete this comment?')){
         setCommentLoading(true)

         const postRef = doc(db, 'posts', postId)
         const docRef = doc(db, 'postComments', id)
         await deleteDoc(docRef)

         await postReplies.forEach(reply => {
            if(reply.data.commentRef === id){
               const docRef = doc(db, 'postReplies', reply.id)
               deleteDoc(docRef)
            }
         })
         
         const newComments = post.comments.filter(commentId => {
            return commentId !== id
         })

         await updateDoc(postRef, {
            comments: [...newComments]
         })

         const updatedComments = comments.filter((comment) => comment.id !== id)

         fetchPost()
         setComments(updatedComments)
         toast.success('Comment deleted')
      }

      setCommentLoading(false)
   }

   const fetchTargetCommentUser = async(comment) => {
      const docRef = doc(db, 'users', comment.data.userRef)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         likeComment(comment, docSnap.data())
      }

   }


   return (
      <div>
         {
            selectedComment &&
            <AddPostReplyModal 
               selectedComment={selectedComment}
               setSelectedComment={setSelectedComment}
               fetchPostReplies={fetchPostReplies}
               post={post}
               postId={postId}
            />
         }
         {
            commentLoading &&
            <FullSpinner />
         }
         {
            comments.map(comment => (
               <>
                  <div className="write-comment-div mb-1" key={comment.id}>
                     {
                        users && users.map((user) => (
                           <div key={user.id}>
                              {
                                 user.id === comment.data.userRef ? 
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
                     <div className="comment-body">
                        <div className="d-flex items-center justify-between">
                           <div className="comment-name">
                              {
                                 users && users.map(user => (
                                    <p key={user.id}>
                                       {
                                          user.id === comment.data.userRef ?
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
                              {/* <small>{moment(comment.data.createdAt.toDate()).startOf('hour').fromNow()}</small> */}
                              {
                                 comment.data.createdAt &&
                                 <small>{format(comment.data.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                              }
                           </div>
                           <div>
                              {
                                 comment.data.userRef === auth.currentUser.uid ||
                                 comment.data.postUserRef === auth.currentUser.uid ?
                                 <MdDelete className='delete-icon' onClick={() => deleteComment(comment.id)} />
                                 :
                                 <></>
                              }
                           </div>
                        </div>
                        <p className='comment-msg'>{ comment.data.comment }</p>

                     </div>
                  </div>
                  
                  {/* Icons space  */}
                  <div>
                     <div className="d-flex items-center justify-between width-full ml-3-5">
                        <div className="blog-icons reply-icons">
                           <div className="blog-icon heart-icon">
                              {
                                 comment.data.likes.includes(auth.currentUser.uid) ? 
                                 <AiFillHeart onClick={() => unlikeComment(comment)}/>
                                 :
                                 <AiOutlineHeart onClick={() => fetchTargetCommentUser(comment)}/>
                              }                           
                              { comment.data.likes.length }
                           </div>
                           <div 
                              className='text-primary reply-btn'
                              onClick={() => setSelectedComment(comment)}
                           > 
                              <small>reply</small> 
                           </div>
                        </div>
                     </div>
                     <div className="repliesDiv ml-3-1">
                        {/* Replies Component  */}
                        <PostReplies 
                           comment={comment}
                           users={users}
                           replies={postReplies}
                           setReplies={setPostReplies}
                        />
                     </div>
                  </div>
               </>
            ))
         }
      </div>
   )
}

export default PostComments