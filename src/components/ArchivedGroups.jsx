import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
//Firebase
import { 
   getDocs, 
   collection,
   query,
   orderBy,
   where,
   doc,
   updateDoc,
   deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import FullSpinner from '../components/FullSpinner'
import Spinner from './Spinner'
import { toast } from 'react-toastify'

function ArchivedGroups({ userId, user }) {

   const [groups, setGroups] = useState(null)
   const [loading, setLoading]  = useState(true)
   const [submitLoading, setSubmitLoading] = useState(false)

   const restoreGroup = async(group) => {
      if(window.confirm("Are you sure you want to restore this group? ")){
         setSubmitLoading(true)
         try{
            const docRef = doc(db, 'groups', group.id)
   
            await updateDoc(docRef, {
               isArchived: false,
               archiveUserRef: ''
            })
   
            setSubmitLoading(false)
            fetchArchivedGroups()
            toast.success('Group restored successfully')
         }catch(err){
            console.log(err)
            toast.error("Something went wrong.")
            setSubmitLoading(false)
         }
      } 
   }

   const deleteGroup = async(group) =>{
      if(window.confirm("Are you sure you want to delete this group permanently?")){
         setSubmitLoading(true)
         try{
            const docRef = doc(db, 'groups', group.id)
            await deleteDoc(docRef)
            
            setSubmitLoading(false)
            fetchArchivedGroups()
            toast.success('Group deleted successfully')
         }catch(err){
            console.log(err)
            toast.error("Something went wrong")
            setSubmitLoading(false)
         }
      }
   }

   const fetchArchivedGroups = async() =>{
      try{
         const groupsRef = collection(db, 'groups') 
      
         const q = query(groupsRef,
            where('archiveUserRef', '==', userId),
            orderBy('createdAt', 'desc')
         )
      
         const querySnap = await getDocs(q)

         const groups = []

         querySnap.forEach((doc) => {
            return groups.push({
               id: doc.id,
               data: doc.data()
            })
         })

         setGroups(groups)
         setLoading(false)
      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
      fetchArchivedGroups()
      //eslint-disable-next-line
   }, [])

   return (
      <>
         {
            submitLoading &&
            <FullSpinner />
         }
         <h3 className='mb-1'>Archived Groups</h3>
         {
            groups && !loading ?
            <>
               {
                  groups.length > 0 ?
                  <div className='blog-container'>
                     {
                        groups && groups.map((group) => (
                           <div key={group.id} className="blog-card room-card">
                              <div className="blog-img-container room-img-container">
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
                                 </div>
                              </div>
                              <div className='restore-delete-btn'>
                                 <button className='restore-room-btn' onClick={() => restoreGroup(group)}>Restore</button>
                              
                                 <button className='delete-room-btn' onClick={() => deleteGroup(group)}>Delete</button>
                              </div>
                           </div>
                        ))
                     }
                  </div>
                  :
                  <small > No archived groups here yet </small>
               }
            </>
            :
            <Spinner />
         }
      </>
   )
}

export default ArchivedGroups