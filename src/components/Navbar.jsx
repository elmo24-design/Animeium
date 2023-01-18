import React, { useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {useCurrentUser} from '../hooks/useCurrentUser'
import {motion} from 'framer-motion'

//lists ui for the pop over
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
//icons
import { MdNotificationsActive } from 'react-icons/md'
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { AiOutlineClose,AiOutlineMenu } from 'react-icons/ai';

import { updateDoc, doc} from 'firebase/firestore';
import { db } from '../firebase.config';

import { getAuth } from 'firebase/auth'

import '../pages/styles/Home.scss'


const smallNavVariants = {
   hidden: {
      x: "-100vh"
   },
   visible: {
      x: 0,
      opacity: 1,
      transition: {
         delay: 0.2
      }
   }
}

function Navbar() {
   const { currentUser } = useCurrentUser()
   const [openMenu, setOpenMenu] = useState(false)

   const [anchorEl, setAnchorEl] = useState(null)
   const auth = getAuth()
   const navigate = useNavigate()
   const location = useLocation()

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };
   
   const signOut = async() => {
      await auth.signOut()
      window.localStorage.removeItem("currentUser")
      navigate('/')
   }

   const clearNotif = async() => {
      const docRef = doc(db, 'users', auth.currentUser.uid)

      if(currentUser && currentUser.notifs.length > 0){
         await updateDoc(docRef, {
            notifs: []
         })
      }
   }

   const closeNav= (e) => {
      if(e.target.classList.contains('s-nav')){
         setOpenMenu(false)
      }
   }

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   return (
      <>
         {
            openMenu &&
            <div className="s-nav" onClick={closeNav}>
               <motion.ul
                  variants={smallNavVariants}
                  initial="hidden"
                  animate="visible"
               >
                  <AiOutlineClose onClick={() => setOpenMenu(false)}/>
                  <li>
                     <NavLink to="/home"> Home </NavLink>
                  </li>
                  <li>
                     <NavLink to="/profile"> Profile </NavLink>
                  </li>
                  <li>
                     <NavLink to="/people"> People  </NavLink>
                  </li>
               </motion.ul>
            </div>
         }
         <nav>
            <div className='menu-btn' onClick={() => setOpenMenu(true)}>
               <AiOutlineMenu />
            </div>
            <ul className='l-nav'>
               <li>
                  <NavLink to="/home"> Home </NavLink>
               </li>
               <li>
                  <NavLink to="/profile"> Profile </NavLink>
               </li>
               <li>
                  <NavLink to="/people"> People  </NavLink>
               </li>
            </ul>
            <ul className='flex items-center'>
               <li className='notif-li'>
                  {
                     currentUser && currentUser.notifs.length > 0 ?
                     <div className='notif-length-nav'>
                        { currentUser.notifs.length }
                     </div>
                     :
                     <></>
                  }
                  
                  <Link to="/notifications" 
                     className={
                        location.pathname === '/notifications' ? 'bell-active' : '' 
                     }
                  > 
                     <MdNotificationsActive onClick={clearNotif} />
                  </Link>
               </li>
               { currentUser &&
                     <>
                        { currentUser.profilePhotoURL === '' ? 
                           <>
                              <div className='flex items-center'>
                                 <div className="default-logo flex items-center justify-center" onClick={handleClick}>
                                    { currentUser.name[0].toUpperCase() }
                                 </div>
                              </div>
                           
                           </>
                           :
                           <div className="profile-container"  onClick={handleClick}>
                              <img 
                                 src={currentUser.profilePhotoURL}
                                 alt="logo" 
                                 className='topnav-logo'
                              />
                           </div>
                        }
                     </>
                  }    
            </ul>

            <Popover
               id={id}
               open={open}
               anchorEl={anchorEl}
               onClose={handleClose}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
               }} 
               >
               <List aria-label="mailbox folders">
                  <Link to="/profile" className="profile-link">
                     <ListItem key="profile" divider button >
                        <ListItemIcon>
                           <PersonIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Profile"/>
                     </ListItem>
                  </Link>
                  <ListItem button onClick={signOut}>
                     <ListItemIcon>
                        <ExitToAppIcon/>
                     </ListItemIcon>
                     <ListItemText primary="Sign Out" />
                  </ListItem>
               </List>
            </Popover>  
         </nav>
       </>
   )
}

export default Navbar