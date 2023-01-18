import React from 'react';
import { motion } from 'framer-motion';

const ProgressBarUpload = ({progress}) => {
   return ( 
      <motion.div className="progress-bar"
         initial={{ width: 0}}
         animate={{ width: progress + '50%'}}
      >
      </motion.div>
   );
}
 
export default ProgressBarUpload;