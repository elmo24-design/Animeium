import React, { useRef, useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
import { BsSearch } from 'react-icons/bs'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import UserItem from '../components/UserItem'
//Hook
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAllUsers } from '../hooks/useAllUsers'
//Firebase
import { getAuth } from 'firebase/auth'

import './styles/Home.scss'
import './styles/People.scss'

function People() {
   const text = useRef()
   const [filteredUsers, setFilteredUsers] = useState(null)

   const { users, loading }  = useAllUsers()
   const { currentUser } = useCurrentUser()

   const auth = getAuth()
  
   const filterChange = () => {
      if(text.current.value !== ''){
         const filteredUsers = users.filter((user) => {
            const regex = new RegExp(`^${text.current.value}`, 'gi')
            return user.data.name.match(regex) 
         })
         setFilteredUsers(filteredUsers)
      }else{
        setFilteredUsers(null)
      }
   }

   useEffect(() => {
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
   }, []);

   return (
      <>
         <div className="container pb-10">
            <Navbar />

            <div className="home">
            
               <h3 className='mt-1'>People</h3>
               {
                  users && currentUser && !loading ?
                  <>
                     <div className='filterInputDiv mt-1'>
                        <input 
                           type="text" 
                           name="filter" 
                           id="filter" 
                           className='filterInput' 
                           placeholder='Search for name'
                           ref={text}
                           autoComplete="off"
                           onChange={filterChange}
                        />                        
                        <BsSearch className='search-icon'/>
                     </div>

                     <div>
                        {
                           filteredUsers !== null ?
                           <div className='user-container'>
                              {
                                 filteredUsers.map(user => (
                                    <div key={user.id}>
                                       <div>
                                          <UserItem 
                                             user={user}
                                             currentUserId={auth.currentUser.uid}
                                          />
                                       </div>
                                    </div>
                                 ))
                              }
                           </div>
                           :
                           <div className='user-container'>
                              {
                                 users.map(user => (
                                    <>
                                       <div key={user.id}>
                                          <UserItem 
                                             user={user}
                                             currentUserId={auth.currentUser.uid}
                                          />
                                       </div>
                                    </>
                                 ))
                              }
                           </div>
                        }
                        
                     </div>
                  </>
                  :
                  <Spinner />
               }
            </div>
         </div>
      </>
   )
}

export default People