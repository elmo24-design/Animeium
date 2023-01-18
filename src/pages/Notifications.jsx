import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAllNotifications } from '../hooks/useAllNotifications'
import Spinner from '../components/Spinner'
import NotifItem from '../components/NotifItem'

import './styles/Notifications.scss'

function Notifications() {

   const {notifications, loading} = useAllNotifications()

   useEffect(() => {
      if(notifications){
         console.log(notifications)
      }
   }, [notifications]);

   return (
      <div className='container pb-10'>
         <Navbar />

         <div className="notifications">
            <h3 className='text-dark mb-1'>Notifications</h3>
            {
               notifications && !loading ? 
               <>
                  {
                     notifications.length > 0 ? 
                     <>
                        {
                           notifications.map(notif => (
                              <NotifItem key={notif.id} notif={notif} />
                           ))
                        }
                     </>   
                     :
                     <small>You have no notifications yet</small>
                  }
               </>
               :
               <Spinner />
            }
         </div>
      </div>
   )
}

export default Notifications