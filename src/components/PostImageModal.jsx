import React from 'react'
import {motion} from 'framer-motion'

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

function PostImageModal({ selectedURL, setSelected}) {

   const handleClick = (e) => {
      if(e.target.classList.contains('backdrop')){
         setSelected(null)
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
            <motion.div className='modal' variants={modal}>
               <img 
                  src={selectedURL} 
                  alt="attachment"
                  className="modal-img"
               />
            </motion.div>
         </motion.div>   
      </>
   )
}

export default PostImageModal