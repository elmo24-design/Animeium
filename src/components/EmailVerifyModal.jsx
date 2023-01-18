import React from 'react'
import {motion} from 'framer-motion'

import logo from '../assets/logo.png'

const backdropVariants = {
   hidden:{
      opacity: 0
   },
   visible: {
      opacity: 1
   }
}
const modal = {
   hidden: {
      y: "-100vh"
   },
   visible: {
      y: 0,
      opacity: 1,
      transition: {
         delay: 0.2
      }
   }
}

function EmailVerifyModal({ setInfoModal }) {

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setInfoModal(false)
      }
   }

   return (
      <>
         <motion.div
            className="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            onClick={handleClick}
         >
            <motion.div className='email-verify-modal' variants={modal}>
               <img src={logo} alt="logo" />
               <div>
                  <h2 className='text-primary'>Animeium</h2>
                  <p>We've sent a verification email to the email address you provided.
                     Please click the link in the email to continue. If you can't see 
                     the email in your inbox, please check the spam folder.
                  </p>
               </div>
               <button className="btn" onClick={() => setInfoModal(false)}>Got it</button>
            </motion.div>
         </motion.div>   
      </>
   )
}

export default EmailVerifyModal