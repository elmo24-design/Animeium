import React from 'react'
import { Link } from 'react-router-dom'

import '../pages/styles/People.scss'

function UserItem({ user, currentUserId }) {
   return (
      <div className='user-card'>
         <Link to={
            user.id === currentUserId ? 
            '/profile' :
            `/people/${user.id}`
         }
         >
            <div className="user-cover-container">
               {
                  user.data.coverPhotoURL === "" ?
                  <></>
                  :
                  <img src={user.data.coverPhotoURL} alt="cover" />
               }
            </div>
            <div className="user-logo-wrapper">
               <div className="user-logo-container">
                  {
                     user.data.profilePhotoURL === "" ? 
                     <div className="room-logo-default">
                        {user.data.name[0].toUpperCase()}
                     </div>
                     :
                     <img src={user.data.profilePhotoURL} alt="Avatar" />
                  }
               </div>
            </div>
            <div className="user-card-info">
               <p>{user.data.name} <span><small>{user.id === currentUserId ? '(you)' : '' }</small></span></p>
            </div>
         </Link>
      </div>
   )
}

export default UserItem