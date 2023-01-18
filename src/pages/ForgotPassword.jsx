import React, { useState } from 'react'
import logo from '../assets/logo.png';
import { NavLink, Navigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import FullSpinner from '../components/FullSpinner';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import {ReactComponent as ReactSocialLight} from '../assets/socialMedia.svg';

function ForgotPassword() {

   const [email, setEmail] = useState('')
   const { loggedIn, checkingStatus } = useAuthStatus()

   const handleSubmit = async (e) => {
      e.preventDefault()
 
      try{
         const auth = getAuth()
         await sendPasswordResetEmail(auth, email) 
         toast.success('Email was sent')
      }catch(err){
         toast.error('Could not send reset Email')
      }
   }

   if(checkingStatus){
      return <FullSpinner />
   }

   return loggedIn ? <Navigate to="/requests" /> : (
      <>
         <div className="auth-container auth-navbar">
            <img src={logo} alt="logo" className="logo" />
            <div className="flex items-center">
               <NavLink to="/">Sign in</NavLink>
               <NavLink to="/signup">Sign up</NavLink>
            </div>
         </div>
         <div className='flex auth-container'>
            <div className="auth-left">
               <div>
                  <h1 className='text-primary'>Animeium</h1>
                  <small className='auth-desc'>Connecting people through Anime</small>
               </div>
               <ReactSocialLight />
            </div>
            <div className="auth-right forgot-password-container">
               <h2 className='text-primary'>Forgot Password</h2>
              
               <form onSubmit={handleSubmit}>
                  <div className="auth-form-group">
                     <label htmlFor="email">Email</label>
                     <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        value={email}
                        o onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>

                  <div>
                     <button type="submit" className='btn reset-pass-btn'> Send reset link </button>
                  </div>
                  
               </form>
            </div>
         </div>
      </>
   )
}

export default ForgotPassword