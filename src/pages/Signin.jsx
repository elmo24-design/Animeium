import React, { useState } from 'react'
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { BsFillEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'
import {ReactComponent as ReactSocialLight} from '../assets/socialMedia.svg';
import FullSpinner from '../components/FullSpinner';
import googleLogo from '../assets/google-logo.png';
import logo from '../assets/logo.png';
import { toast } from 'react-toastify';
import { useAuthStatus } from '../hooks/useAuthStatus';
//Firebase
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider  } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp} from 'firebase/firestore'
import { db } from '../firebase.config';

import './styles/Auth.scss'

function Signin() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const auth = getAuth()

      const userCred = await signInWithEmailAndPassword(auth, email, password) 

      if(userCred.user.emailVerified === true){
        navigate('/home')
        setLoading(false)
        toast.success('Welcome back! You are now logged in')
      }else{
        auth.signOut()
        toast.error("Email not verified")
        setLoading(false)
      }
      
    }catch(err){
      console.log(err)
      setLoading(false)
      toast.error('Invalid user credentials')
    }
  }

  const onGoogleClick = async () => {
    try{
       const auth = getAuth()
       const provider = new GoogleAuthProvider()
       
       const result = await signInWithPopup(auth, provider)
       const user = result.user //Get the user from the google sign in

       //Check for user in firestore
       const userRef = doc(db, 'users', user.uid)
       const docSnap = await getDoc(userRef)

       if(!docSnap.exists()){
          await setDoc(doc(db, 'users', user.uid), {
             name: user.displayName,
             email: user.email,
             bio: '',
             profilePhotoURL: '',
             coverPhotoURL: '',
             facebookLink: '',
             twitterLink: '',
             instagramLink: '',
             youtubeLink: '',
             personalWebsiteLink: '',
             notifs: [],
             createdAt: serverTimestamp()
          })
       }

       navigate('/home')
       toast.success('Welcome back! You are now logged in')
    }catch(err){
       toast.error('Could not authorize with Google')
    }
  }

  const { loggedIn, checkingStatus } = useAuthStatus()

  if(checkingStatus){
    return <FullSpinner />
  }

  return loggedIn ? <Navigate to="/home" /> : (
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
        <div className="auth-right signin-container">
          <h2 className='text-primary'>Sign in to Animeium</h2>
          <small>Not a member yet ? 
            <Link to="/signup" className='decoration-none'>
              <span className='text-primary'> Sign up</span>
            </Link>
          </small>
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
            <div className="auth-form-group passwordInputDiv">
              <label htmlFor="password">Password</label>
              <input 
                className='passwordInput'
                type={ showPassword ? "text" : "password" }  
                name="password" 
                id="password" 
                placeholder='+6 Characters'
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {
                showPassword ?
                <BsFillEyeSlashFill
                  className="eye-show"
                  onClick={() => setShowPassword((prevState) => !prevState )}
                /> 
                :
                <BsFillEyeFill 
                  className="eye-show"
                  onClick={() => setShowPassword((prevState) => !prevState )}
                />
              }
            </div>
            <div className='forgot-password-link'>
              <Link to="/forgot-password" >
                Forgot password? 
              </Link>
            </div>
            {
              loading ?
              <button type="submit" disabled className='auth-button disabled-btn'> Loading... </button>
              :
              <div>
                <button type="submit" className='btn auth-button'> Sign in </button>
              </div>
            }
          </form>
          <button className='btn auth-button google-btn' onClick={onGoogleClick}>
            <img src={googleLogo} alt="google" />
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  )
}

export default Signin