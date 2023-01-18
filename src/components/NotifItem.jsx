import React, {Fragment} from 'react'
import { useAllUsers } from '../hooks/useAllUsers'
import { useNavigate } from 'react-router-dom'
import { MdDelete } from 'react-icons/md'

import { toast } from 'react-toastify'

import { 
   doc,
   updateDoc,
   deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'


function NotifItem({ notif }) {
   const { users }  = useAllUsers()

   const navigate = useNavigate()
   const {format} = require('date-fns');

   const viewPost = async() => {
      navigate(`/home/post/${notif.data.postRef}`)

      const docRef = doc(db, 'notifications', notif.id)

      await updateDoc(docRef, {
         className: 'notif-seen'
      })
   }

   const deleteNotif = async() =>{
      if(window.confirm("Are you sure you want to delete this notification permanently?")){
         try{
            const docRef = doc(db, 'notifications', notif.id)
            await deleteDoc(docRef)

            toast.success('Notification deleted successfully')
         }catch(err){
            console.log(err)
            toast.error("Something went wrong")
         }
      }
   }

   return (
      <div className={`notif-card ${notif.data.className}`}>
         <div onClick={viewPost}>
            {
               users && users.map((user) => (
                  <Fragment key={user.id}>
                     {
                        user.id === notif.data.userRef ? 
                        <>
                           {
                              user.data.profilePhotoURL === '' ?
                              <div className='notif-card-inner'>
                                 <div className="default-logo d-flex items-center justify-center">
                                    { user.data.name[0].toUpperCase() }
                                 </div>
                                 <div className='ml-6px notif-info'>
                                    {
                                       notif.data.createdAt &&
                                       <div>
                                          <small className='notif-date'>{format(notif.data.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                                       </div>
                                    }
                                    <span className='font-bold'> { user.data.name }</span>
                                    <span className='ml-6px notif-info'>
                                       {notif.data.content}
                                    </span>
                                 </div>
                              </div>
                              :
                              <div className='notif-card-inner'>
                                 <div className="profile-container">
                                    <img 
                                       src={user.data.profilePhotoURL}
                                       alt="logo" 
                                       className='comment-logo'
                                    />
                                 </div>
                                 <div className='ml-6px notif-info'>
                                    {
                                       notif.data.createdAt &&
                                       <div>
                                          <small className='notif-date'>{format(notif.data.createdAt.toDate(), 'do  MMMM yyyy')}</small>
                                       </div>
                                    }
                                    <span className='font-bold'> { user.data.name }</span>
                                    <span className='ml-6px notif-info'>
                                       {notif.data.content}
                                    </span>
                                 </div>
                              </div>     
                           }
                        </>
                        :
                        <></>
                     }
                  </Fragment>
               ))
            }
         </div>
         <MdDelete className='notif-delete' onClick={deleteNotif}/>
      </div>
   )
}

export default NotifItem