import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

import Spinner from '../components/Spinner'
import EditProfileCoverModal from '../components/EditProfileCoverModal'
import EditProfilePictureModal from '../components/EditProfilePictureModal'
//Tabs
import ProfileGroups from '../components/ProfileGroups'
import EditAccountForm from '../components/EditAccountForm' 
import EditAccountPassword from '../components/EditAccountPassword'
import ArchivedGroups from '../components/ArchivedGroups'
import ArchivedPostItem from '../components/ArchivedPostItem'

import { BsFillCameraFill } from 'react-icons/bs'
import { getAuth } from 'firebase/auth'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAuthStatus } from '../hooks/useAuthStatus'

//Social links icons
import { BsFacebook, BsTwitter, BsYoutube } from 'react-icons/bs'
import { AiFillInstagram } from 'react-icons/ai'
import { TfiWorld } from 'react-icons/tfi'

//Firebase
import { 
   getDocs, 
   collection,
   query,
   orderBy,
   where
} from 'firebase/firestore'
import { db } from '../firebase.config'

import './styles/Profile.scss'


function Profile() {
   const { userId } = useAuthStatus()

   //Archived blogs
   const [archivedPosts, setArchivedPosts] = useState(null)
   const [archivedPostsLoading, setArchivedPostsLoading] = useState(true)

   const auth = getAuth()
   const { currentUser, loading, fetchUser } = useCurrentUser()
   const [selectedUser, setSelectedUser] = useState(null)
   const [selectedProfile, setSelectedProfile] = useState(null)

   const [tab, setTab] = useState(1)

   const changeTab = (num) => {
      setTab(num)
   } 

   const fetchArchivedPosts = async() =>{
      try{
         const archivedPostsRef = collection(db, 'posts') 
      
         const q = query(archivedPostsRef,
            where('archiveUserRef', '==', userId),
            orderBy('createdAt', 'desc')
         )
      
         const querySnap = await getDocs(q)

         const archivedPosts = []

         querySnap.forEach((doc) => {
            return archivedPosts.push({
               id: doc.id,
               data: doc.data()
            })
         })

         setArchivedPosts(archivedPosts)
         setArchivedPostsLoading(false)
      }catch(err){
         console.log(err)
      }
   }

   useEffect(() => {
      fetchArchivedPosts()
      
      //eslint-disable-next-line
   }, [userId])

   useEffect(() => {
      // 👇️ scroll to top on page load
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    }, []);


   return (
      <>
         {
            selectedProfile &&
            <EditProfilePictureModal 
               userId={auth.currentUser.uid}
               setSelectedUser={setSelectedProfile}
               fetchUser={fetchUser}
            />
         }
         {
            selectedUser &&
            <EditProfileCoverModal 
               userId={auth.currentUser.uid}
               setSelectedUser={setSelectedUser}
               fetchUser={fetchUser}
            />
         }
         <div className="container pb-10">
            <Navbar />
          
            <div className='home'>
              
               <h3 className='mt-1'>My Profile</h3>
             
               {
                  currentUser && !loading ?
                  <>
                     <div className="profile-box">
                        <div className="cover-photo-container">
                           {
                              currentUser.coverPhotoURL !== "" ?
                              <img src={currentUser.coverPhotoURL} alt="CoverPhoto" />
                              :
                              <></>
                           }
                           <button onClick={() => setSelectedUser(currentUser)}>
                              <BsFillCameraFill />
                              <span>Edit Cover Photo</span>
                           </button>
                        </div>
                        <div className="profile-box-bottom">
                           
                           <div className='profile-photo-wrapper'>
                              {
                                 currentUser.profilePhotoURL === "" ?
                                 <div className="profile-photo-container default-container">
                                    { currentUser.name[0].toUpperCase() }
                                 </div>
                                 :
                                 <div className="profile-photo-container">
                                    <img src={currentUser.profilePhotoURL} alt="profilePhoto" />
                                 </div>
                              }
                              <div className="camera-container" onClick={() => setSelectedProfile(currentUser)}>
                                 <BsFillCameraFill />
                              </div>
                           </div>
                         
                           <div className="profile-name">
                              <h2>{currentUser.name}</h2>
                              <small>{currentUser.bio}</small>
                           </div>

                           <div className="social-links">
                              {
                                 currentUser.facebookLink && 
                                 <a href={currentUser.facebookLink} target="_blank" rel="noreferrer">
                                    <BsFacebook />
                                 </a>
                              }
                              {
                                 currentUser.twitterLink && 
                                 <a href={currentUser.twitterLink} target="_blank" rel="noreferrer">
                                    <BsTwitter />
                                 </a>
                              }
                              {
                                 currentUser.instagramLink && 
                                 <a href={currentUser.instagramLink} target="_blank" rel="noreferrer">
                                    <AiFillInstagram />
                                 </a>
                              }
                              {
                                 currentUser.youtubeLink && 
                                 <a href={currentUser.youtubeLink} target="_blank" rel="noreferrer">
                                    <BsYoutube />
                                 </a>
                              }
                              {
                                 currentUser.personalWebsiteLink && 
                                 <a href={currentUser.personalWebsiteLink} target="_blank" rel="noreferrer">
                                    <TfiWorld />
                                 </a>
                              }
                           </div>

                        </div>
                     </div>  

                     <div className="profile-tabs-header">
                        <div className={`tab-header-1 ${tab === 1 ? "active-tab" : ""}`} onClick={() => changeTab(1)}>Your Groups</div>
                        <div className={`tab-header-2 ${tab === 2 ? "active-tab" : ""}`} onClick={() => changeTab(2)}>Edit Account Info</div>
                        <div className={`tab-header-3 ${tab === 3 ? "active-tab" : ""}`} onClick={() => changeTab(3)}>Change Password</div>
                        <div className={`tab-header-4 ${tab === 4 ? "active-tab" : ""}`} onClick={() => changeTab(4)}>My Archive</div>
                     </div>

                     {
                        tab === 1 ?
                        <div>
                           <h4 className='mb-1 text-dark'>Groups you joined or manage</h4>
                           <ProfileGroups
                              userId={auth.currentUser.uid}
                           />
                        </div>
                        : tab === 2 ?
                        <div>
                           <h4>Edit Account Info</h4>
                           <EditAccountForm 
                              user={currentUser}
                              fetchUser={fetchUser}
                              userId={auth.currentUser.uid}
                           />
                        </div>
                        : tab === 3 ?
                        <div>
                           <h4>Change Password</h4>
                           <EditAccountPassword />
                        </div>
                        :
                        <div>  
                           <ArchivedGroups
                              userId={auth.currentUser.uid}
                              user={currentUser}
                           />

                           {
                              archivedPosts && !archivedPostsLoading ?
                              <div className='mt-2 mb-1'>
                                 <h3 className='mb-1'>Archived Posts</h3>
                                 {
                                    archivedPosts.length > 0 ?
                                    <>
                                       <div className="mt-1">
                                          {
                                             archivedPosts.map(post => (
                                                <div key={post.id} className="mt-1">
                                                   <ArchivedPostItem 
                                                      post={post}
                                                      fetchArchivedPosts={fetchArchivedPosts}
                                                      user={currentUser}
                                                   />
                                                </div>
                                             ))
                                          }
                                       </div>
                                    </>
                                    :
                                    <small> No archived posts here yet </small>
                                 }
                              </div>
                              :
                              <Spinner />
                           }

                        </div>
                     }
                  </>
                  :
                  <Spinner />

               }               
            </div>
         </div>
      </>
   )
}

export default Profile