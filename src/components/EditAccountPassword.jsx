import React, { useState } from 'react'
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs'
import { toast } from 'react-toastify'
//Firebase
import { getAuth, updatePassword } from 'firebase/auth'


function EditAccountPassword() {
   const [showPassword, setShowPassword] = useState(false)
   const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

   const [loading, setLoading] = useState(false)

   const [newPassword, setNewPassword] = useState('')
   const [confirmNewPassword, setConfirmNewPassword] = useState('')

   const auth = getAuth()
 
   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      try{
         if(newPassword === confirmNewPassword){

            updatePassword(auth.currentUser, newPassword)

            toast.success("Password changed succsessfully")
            setLoading(false)
         }else{
            toast.error('Password does not match')
            setLoading(false)
         }

      }catch(err){
         toast.error('Something went wrong.')
         setLoading(false)
      }
   }


   return (
         <form action="" onSubmit={handleSubmit}>
            <div className="auth-form-group passwordInputDiv">
               <label htmlFor="newPassword">New Password</label>
               <input 
                  className='passwordInput'
                  type={ showPassword ? "text" : "password" }
                  name="newPassword" 
                  id="newPassword" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
               <label htmlFor="confirm_password">Confirm New Password</label>
               <input 
                  className='passwordInput'
                  type={ showPasswordConfirm ? "text" : "password" }
                  name="confirm_password" 
                  id="confirm_password" 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
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

            
            <div className="auth-footer">
               {
                  loading ?
                  <button type="submit" disabled className='w-regular disabled-btn'> Loading... </button>
                  :
                  <button type="submit" className='w-regular'> Submit </button>
               }       
            </div>
            
         </form>
         
   )
}

export default EditAccountPassword