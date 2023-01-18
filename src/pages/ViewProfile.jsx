import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
//Tabs
import ProfileGroups from '../components/ProfileGroups'

import { BiArrowBack } from 'react-icons/bi'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useParams, useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'

//Social links icons
import { BsFacebook, BsTwitter, BsYoutube } from 'react-icons/bs'
import { AiFillInstagram } from 'react-icons/ai'
import { TfiWorld } from 'react-icons/tfi'

//Firebase
import { 
   doc, 
   getDoc, 
} from 'firebase/firestore'
import { db } from '../firebase.config'

import './styles/Profile.scss'

function ViewProfile() {
   const [user, setUser] = useState(null)
   const { currentUser } = useCurrentUser()

   const [loading, setLoading] = useState(true)

   // const auth = getAuth()
   const { userId } = useParams()
   const navigate = useNavigate()

   const fetchUser = async() => {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setUser(docSnap.data())
         setLoading(false)
      }else{
         navigate('/people')
         toast.error('User does not exist')
      }
   }

   useEffect(() => {
      fetchUser()

      //eslint-disable-next-line
   }, [userId])

   useEffect(() => {
      // 👇️ scroll to top on page load
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    }, []);

   return (
      <>
         <div className="container pb-19">
            <Navbar />

            <div className='home'>
               <div className='back font-bold cursor-pointer' onClick={() => navigate(-1)}>
                  <BiArrowBack />
                  { user && user.name }'s Profile
               </div>
               {
                  user && currentUser && !loading ?
                  <>
                     <div className="profile-box">
                        <div className="cover-photo-container">
                           {
                              user.coverPhotoURL !== "" ?
                              <img src={user.coverPhotoURL} alt="CoverPhoto" />
                              :
                              <></>
                           }
                        </div>

                        <div className="profile-box-bottom">
                           
                           <div className='profile-photo-wrapper'>
                              {
                                 user.profilePhotoURL === "" ?
                                 <div className="profile-photo-container default-container">
                                    { user.name[0].toUpperCase() }
                                 </div>
                                 :
                                 <div className="profile-photo-container">
                                    <img src={user.profilePhotoURL} alt="profilePhoto" />
                                 </div>
                              }
                           </div>
                         
                           <div className="profile-name">
                              <div>
                                 <h2>{user.name}</h2>
                                 <small>{user.bio}</small>
                              </div>
                           </div>

                           <div className="social-links">
                              {
                                 user.facebookLink && 
                                 <a href={user.facebookLink} target="_blank" rel="noreferrer">
                                    <BsFacebook />
                                 </a>
                              }
                              {
                                 user.twitterLink && 
                                 <a href={user.twitterLink} target="_blank" rel="noreferrer">
                                    <BsTwitter />
                                 </a>
                              }
                              {
                                 user.instagramLink && 
                                 <a href={user.instagramLink} target="_blank" rel="noreferrer">
                                    <AiFillInstagram />
                                 </a>
                              }
                              {
                                 user.youtubeLink && 
                                 <a href={user.youtubeLink} target="_blank" rel="noreferrer">
                                    <BsYoutube />
                                 </a>
                              }
                              {
                                 user.personalWebsiteLink && 
                                 <a href={user.personalWebsiteLink} target="_blank" rel="noreferrer">
                                    <TfiWorld />
                                 </a>
                              }
                           </div>
                        </div>
                     </div>  
            
                     <div className='mt-1 mb-1'>
                        <div>{user.name}'s Rooms</div>
                     </div>

                     <div>
                        <ProfileGroups
                           userId={userId}
                        />
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

export default ViewProfile