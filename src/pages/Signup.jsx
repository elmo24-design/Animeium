import React, { useState } from 'react'
import { Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { BsFillEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'

import {ReactComponent as ReactSocialLight} from '../assets/socialMedia.svg';
import FullSpinner from '../components/FullSpinner'
import googleLogo from '../assets/google-logo.png'
import logo from '../assets/logo.png'
import EmailVerifyModal from '../components/EmailVerifyModal';
import { toast } from 'react-toastify';

import { useAuthStatus } from '../hooks/useAuthStatus';
//Firebase
import { 
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile, 
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth'
import { db } from '../firebase.config'
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

import './styles/Auth.scss'

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [infoModal, setInfoModal] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault()
    setLoading(true)
    try{
      if(password !== confirmPassword){
        toast.error("Password does not match")
        setLoading(false)
        return
      }else{
        const auth = getAuth()

        const userCred = await createUserWithEmailAndPassword(auth, email, password) 
  
        const user = userCred.user
  
        updateProfile(auth.currentUser, {
          displayName: name 
        })
  
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
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
  
        sendEmailVerification(user).then(() => {
          auth.signOut() 
          toast.success("A verification link was sent to your email.")
          navigate('/signup')
        })
  
  
        // navigate('/home')
        setLoading(false)
        setInfoModal(true)
        // toast.success('Welcome back! You are now logged in')
      }
    }catch(err){
      console.log(err)
      setLoading(false)
      toast.error("Email already exists")
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
    }catch(err){
       toast.error('Could not authorize with Google')
    }
  }

  const { loggedIn, checkingStatus } = useAuthStatus()

  if(checkingStatus){
    return <FullSpinner />
  }

  return loggedIn ? <Navigate to="/home" /> :  (
    <>
      {
        infoModal &&
        <EmailVerifyModal 
          setInfoModal={setInfoModal}
        />
      }
      <div className="auth-container auth-navbar">
        <img src={logo} alt="logo" className="logo" />
        <div className="flex items-center">
          <NavLink to="/">Sign in</NavLink>
          <NavLink to="/signup">Sign up</NavLink>
        </div>
      </div>
      <div className='auth-container'>
        <div className="auth-left">
          <div>
            <h1 className='text-primary'>Animeium</h1>
            <small className='auth-desc'>Connecting people through Anime</small>
          </div>
          <ReactSocialLight />
        </div>
        <div className="auth-right auth-right-signup">
          <h2 className='text-primary'>Sign up to Animeium</h2>
          <small>Already a member? 
            <Link to="/" className='decoration-none'>
              <span className='text-primary'> Sign in</span>
            </Link>
          </small>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
            </div>
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
            <div className="auth-form-group passwordInputDiv">
              <label htmlFor="password">Confirm Password</label>
              <input 
                className='passwordInput'
                type={ showPasswordConfirm ? "text" : "password" }
                name="confirmPassword" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {
                showPasswordConfirm ?
                <BsFillEyeSlashFill
                    className="eye-show"
                    onClick={() => setShowPasswordConfirm((prevState) => !prevState )}
                /> 
                :
                <BsFillEyeFill 
                    className="eye-show"
                    onClick={() => setShowPasswordConfirm((prevState) => !prevState )}
                />
              }
            </div>
            {
              loading ?
              <button type="submit" disabled className='auth-button disabled-btn'> Loading... </button>
              :
              <div>
                <button type="submit" className='btn auth-button'> Sign up </button>
              </div>
            }
          </form>
          <button className='btn auth-button google-btn' onClick={onGoogleClick}>
            <img src={googleLogo} alt="google" />
            Sign up with Google
          </button>
        </div>
      </div>
    </>
  )
}

export default Signup