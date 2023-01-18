import React from 'react'
import { Link } from 'react-router-dom'
import { useAllGroups } from '../hooks/useAllGroups'
import Spinner from './Spinner'
import { getAuth } from 'firebase/auth'
import { Fragment } from 'react'

function ProfileGroups({ userId }) {

   const auth = getAuth()
   const {groups, loading} = useAllGroups()

   return (
      <>
         {
            groups && !loading ?
            <>
               {
                  groups.length > 0 ? 
                  <div className='blog-container'>
                     {
                        groups.map((group) => (
                           <Fragment key={group.id}>
                              {
                                 group.data.members.includes(userId) ?
                                 <div className="blog-card room-card">
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
                                 </div>
                                 :
                                 <>
                                    
                                 </>
                              }
                           </Fragment>
                        ))
                     }
                  </div>
                  :
                  <> No groups here yet </>
               }
            </>
            :
            <Spinner />
         }
      </>
   )
}

export default ProfileGroups