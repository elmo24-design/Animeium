import React, { useState } from 'react'
import { toast } from 'react-toastify'
//Firebase
import { db } from '../firebase.config'
import { 
   doc, 
   updateDoc,
} from 'firebase/firestore'

function EditAccountForm({ user, fetchUser, userId }) {
   const [submitLoading, setSubmitLoading] = useState(false)

   const [formData, setFormData] = useState({
      name: user.name,
      bio: user.bio,
      facebookLink: user.facebookLink,
      twitterLink: user.twitterLink,
      instagramLink: user.instagramLink,
      youtubeLink: user.youtubeLink,
      personalWebsiteLink: user.personalWebsiteLink,
   })
  
   const {
      name,
      bio,
      facebookLink,
      twitterLink,
      instagramLink,
      youtubeLink,
      personalWebsiteLink
   } = formData

   const onChange = (e) => {
      setFormData((prevState) => ({
         ...prevState,
         [e.target.id]: e.target.value
      }))
   }

   const handleSubmit = async(e) => {
      e.preventDefault()
      setSubmitLoading(true)
      try{         

         const docRef = doc(db, 'users', userId)
         await updateDoc(docRef, {
            name: name,
            bio: bio,
            facebookLink:  facebookLink,
            twitterLink:  twitterLink,
            instagramLink: instagramLink,
            youtubeLink: youtubeLink,
            personalWebsiteLink: personalWebsiteLink,
         })

         fetchUser()
         setSubmitLoading(false)
         toast.success("Account Info updated")
      }catch(err){
         console.log(err)
         toast.error('Something went wrong')
         setSubmitLoading(false)
      }
   }

   return (
      <> 
         <form onSubmit={handleSubmit}>

            <div className="auth-form-group">
               <label htmlFor="name">Username</label>
               <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  value={name}
                  onChange={onChange}
                  required
               />
            </div>
                
            <div className="auth-form-group">
               <label htmlFor="name">Bio</label>
               <input 
                  type="text" 
                  name="bio" 
                  id="bio" 
                  value={bio}
                  onChange={onChange}
                  required
               />
            </div>

            <div className="auth-form-group">
               <label htmlFor="facebookLink">Facebook Link</label>
               <input 
                  type="text" 
                  name="facebookLink" 
                  id="facebookLink" 
                  value={facebookLink}
                  onChange={onChange}
               />
            </div>

            <div className="auth-form-group">
               <label htmlFor="twitterLink">Twitter Link</label>
               <input 
                  type="text" 
                  name="twitterLink" 
                  id="twitterLink" 
                  value={twitterLink}
                  onChange={onChange}
               />
            </div>

            <div className="auth-form-group">
               <label htmlFor="instagramLink">Instagram Link</label>
               <input 
                  type="text" 
                  name="instagramLink" 
                  id="instagramLink" 
                  value={instagramLink}
                  onChange={onChange}
               />
            </div>

            <div className="auth-form-group">
               <label htmlFor="youtubeLink">Youtube Link</label>
               <input 
                  type="text" 
                  name="youtubeLink" 
                  id="youtubeLink" 
                  value={youtubeLink}
                  onChange={onChange}
               />
            </div>

            <div className="auth-form-group">
               <label htmlFor="personalWebsiteLink">Personal website Link</label>
               <input 
                  type="text" 
                  name="personalWebsiteLink" 
                  id="personalWebsiteLink" 
                  value={personalWebsiteLink}
                  onChange={onChange}
               />
            </div>

            <div className="auth-footer">
               {
                  submitLoading ?
                  <button type="submit" disabled className='w-regular disabled-btn'> Updating... </button>
                  :
                  <button type="submit" className='w-regular'> Update </button>
               }
            </div>
         
         </form>  
      </>
   )
}

export default EditAccountForm