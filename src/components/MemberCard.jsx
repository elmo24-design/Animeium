import React from 'react'
import { Link } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

function MemberCard({ member, removeMember, group }) {
   const auth = getAuth()

   return (
      <div className='member-card'>
         {
            group.userRef === auth.currentUser.uid ?
            <>
               {
                  member.id !== group.userRef ? 
                  <p className='remove-text' onClick={() => removeMember(member.id)}>Remove</p>
                  :
                  <> </>
               }
            </>
            :
            <></>
         }
        
         <div className="member-logo-container">
            {
               member.data.profilePhotoURL === "" ?
               <div className="member-default-logo">
                  {member.data.name[0].toUpperCase()}
               </div>
               :
               <img src={member.data.profilePhotoURL} alt="logo" />
            }
         </div>
         <div className="member-info">
            <Link 
               to={
                  member.id === auth.currentUser.uid ? 
                  '/profile' :
                  `/people/${member.id}`
               }
               className="decoration-none"
            >
               <div className='d-flex items-center justify-center'>
                  <p>{member.data.name} </p>
                  {
                     member.id === auth.currentUser.uid ?
                     <small>(you)</small>
                     :
                     <></>
                  }
               </div>
            </Link>
         </div>

      </div>
  )
}

export default MemberCard