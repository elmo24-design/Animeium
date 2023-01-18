import React from 'react'
import { Link } from 'react-router-dom'
//Firebase
import { getAuth } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import FullSpinner from './FullSpinner'
import { useState } from 'react'
import { toast } from 'react-toastify'

function Groups({ groups, fetchGroups }) {

   const auth = getAuth()
   const [loading, setLoading]  = useState(false)


   const request = async(group) => {
      setLoading(true)

      try{
         const newRequest = auth.currentUser.uid
         const docRef = doc(db, 'groups', group.id)
   
         await updateDoc(docRef, {
            joinRequests: [ ...group.data.joinRequests, newRequest]
         })

         setLoading(false)
         toast.success(`Request submitted to join ${group.data.groupName}`)
      }catch(err){
         console.log(err)
         setLoading(false)
      }
   
      fetchGroups()
   }

   const joinGroup = async(group) => {
      setLoading(true)

      try{
         const newMember = auth.currentUser.uid
         const docRef = doc(db, 'groups', group.id)
   
         await updateDoc(docRef, {
            members: [ ...group.data.members, newMember]
         })

         setLoading(false)
         toast.success(`You joined ${group.data.groupName}`)
      }catch(err){
         console.log(err)
         setLoading(false)
      }
   
      fetchGroups()
   }

   return (
      <>
         {
            loading &&
            <FullSpinner />
         }
         <div className='grid-3-container'>
            {
               groups.map((group) => (
                  <div key={group.id} className="blog-card room-card">
                     <div className="room-img-container">
                        {
                           group.data.coverPhotoURL === "" ?
                           <></>
                           :
                           <img src={group.data.coverPhotoURL} alt="blog-img" />
                        }
                        
                     </div>
                     <div className='room-card-bottom'>
                        <div className="room-logo-container">
                           {
                              group.data.logoURL === "" ? 
                              <div className="room-logo-default">
                                 {group.data.groupName[0].toUpperCase()}
                              </div>
                              :
                              <img src={group.data.logoURL} alt="Logo" />
                           }
                        </div>
                        <div className="roomName">
                           <Link to={`/home/${group.id}`} className="decoration-none">
                              <h3>{group.data.groupName}</h3>
                           </Link>
                           <small>({group.data.status} group)</small>
                           {
                              group.data.members.includes(auth.currentUser.uid) ?
                              <button className='joined'>Joined</button>
                              :
                              <>
                                 {
                                    group.data.status === 'Private' ?
                                    <>
                                       {
                                          group.data.joinRequests.includes(auth.currentUser.uid) ?
                                          <button className="requested">Requested</button>
                                          :
                                          <button onClick={() => request(group)}>Request to join</button>
                                       }
                                    </>
                                    :
                                    <button onClick={() => joinGroup(group)}>Join</button>
                                 }
                                 
                              </>
                           }
                        </div>
                     </div>
                  </div>
               ))
            }
         </div>
      </>
   )
}

export default Groups