import React from 'react'
import { MdDelete } from 'react-icons/md'
import { getAuth } from 'firebase/auth'
// import moment from 'moment/moment'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
//Firebase 
import { 
   doc, 
   deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase.config'

function PostReplies({ comment, users, replies, setReplies}) {
   const auth = getAuth()
   const {format} = require('date-fns');

   const deleteReply = async(reply) => {
      if(window.confirm('Are you sure you want to delete this reply?')){

         const docRef = doc(db, 'postReplies', reply.id)
         await deleteDoc(docRef)
      
         const updatedReplies = replies.filter((item) => item.id !== reply.id)

         setReplies(updatedReplies)
         toast.success('Reply deleted')
      }
   }

   return (
      <>
         {
            replies && replies.map(reply => (
               <div key={reply.id}>
                  {
                     reply.data.commentRef === comment.id ?
                     <div div className="write-comment-div">
                        {/* First div  - logo */}
                        {
                           users && users.map((user) => (
                              <div key={user.id}>
                                 {
                                    user.id === reply.data.userRef ? 
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
                        <div className="comment-body reply-body">
                           <div className="d-flex items-center justify-between">
                              <div className="comment-name">
                                 {
                                    users && users.map(user => (
                                       <p key={user.id}>
                                          {
                                             user.id === reply.data.userRef ?
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
                                    reply.data.createdAt &&
                                    <small>{format(reply.data.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                                 }
                              </div>
                              <div>
                                 {
                                    reply.data.userRef === auth.currentUser.uid ||
                                    reply.data.postUserRef === auth.currentUser.uid ?
                                    <MdDelete className='delete-icon' onClick={() => deleteReply(reply)} />
                                    :
                                    <></>
                                 }
                              </div>
                           </div>
                           <p className='comment-msg'>{ reply.data.reply }</p>
                        </div>
                     </div>
                     :
                     <></>
                  }
               </div>
            ))
         }
      </>
   )
}

export default PostReplies