import React, { useState, useEffect} from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import FullSpinner from '../components/FullSpinner'
import { BsFillCameraFill } from 'react-icons/bs'
import { BiArrowBack } from 'react-icons/bi'
import PostItem from '../components/PostItem'
import MemberCard from '../components/MemberCard'
import JoinRequestCard from '../components/JoinRequestCard'

//Modals
import EditGroupCoverModal from '../components/EditGroupCoverModal'
import EditGroupLogoModal from '../components/EditGroupLogoModal'
import AddPostModal from '../components/AddPostModal'

//Hooks
import { useAllUsers } from '../hooks/useAllUsers'

//Firebase
import { 
   getDoc, 
   doc, 
   updateDoc,
   collection,
   query,
   where ,
   orderBy,
   onSnapshot
} from 'firebase/firestore'
import {  getAuth } from 'firebase/auth'
import { db } from '../firebase.config'

import './styles/Profile.scss'
import './styles/Group.scss'
import { Fragment } from 'react'

function Group() {
   const [group, setGroup] = useState(null)
   const [posts, setPosts] = useState(null)
   const [archivedPosts, setArchivedPosts] = useState(null)
   const [members, setMembers] = useState(null)
   const [pendingMembers, setPendingMembers] = useState(null)

   const [loading, setLoading] = useState(false)
   const [postsLoading, setPostsLoading] = useState(false)
   const [submitLoading, setSubmitLoading] = useState(false)

   //Modals
   const [selectedGroup, setSelectedGroup] = useState(null) 
   const [selectedGroupLogo, setSelectedGroupForLogo] = useState(null)
   const [addModal, setAddModal] = useState(false)

   //For notif
   const [targetUser, setTargetUser] = useState(null)

   const auth = getAuth()
   const navigate = useNavigate()
   const { users } = useAllUsers()
   const { groupId } = useParams()

   const [tab, setTab] = useState(1)

   const changeTab = (num) => {
      setTab(num)
   }

   const fetchGroup = async() => {
      const docRef = doc(db, 'groups', groupId)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setGroup(docSnap.data())
         setLoading(false)
      }else{
         navigate('/home')
         toast.error('Group does not exist')
      }
   }

   //Fetch posts
   const fetchPosts = async() => {
      try{
         const postsRef = collection(db, 'posts') 
     
         const q = query(postsRef, 
           where('groupRef', '==', groupId),
           orderBy('createdAt', 'desc')
         )
         
         //Traditional fetch

         // const posts = []
         // const archived = []

         // querySnap.forEach((doc) => {
         //    if(doc.data().isArchived !== true){
         //       return posts.push({
         //          id: doc.id,
         //          data: doc.data()
         //       })
         //    }else{
         //       return archived.push({
         //          id: doc.id,
         //          data: doc.data()
         //       })
         //    }
         // })
 
         //Real-time update
         onSnapshot(q, (querySnap) => {
            const posts = []
            const archived = []

            querySnap.forEach((doc) => {
               if(doc.data().isArchived !== true){
                  return posts.push({
                     id: doc.id,
                     data: doc.data()
                  })
               }else{
                  return archived.push({
                     id: doc.id,
                     data: doc.data()
                  })
               }
            })

            setPosts(posts)
            setArchivedPosts(archived)
            setPostsLoading(false)
         })

      }catch(err){
         console.log(err)
      }
   }

   const fetchTargetUser = async() => {
      const docRef = doc(db, 'users', group.userRef)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
         setTargetUser(docSnap.data())
      }
   }


   useEffect(() => {
      fetchGroup()
      fetchPosts()

      if(group){
         fetchTargetUser()
      }

      //eslint-disable-next-line
   }, [group])

   useEffect(() => {

      if(users && group){
         const members = users.filter(user => {
            return group.members.includes(user.id)
         })
         setMembers(members)

         const membersRequests = users.filter(user => {
            return group.joinRequests.includes(user.id)
         })
         setPendingMembers(membersRequests)
      }

      //eslint-disable-next-line
   }, [users, group])

   //Actions
   const archiveGroup = async() => {
      if(window.confirm("Are you sure you want to archive this group? ")){
         setSubmitLoading(true)
         try{
            const docRef = doc(db, 'groups', groupId)
   
            await updateDoc(docRef, {
               isArchived: true, 
               archiveUserRef: auth.currentUser.uid
            })
   
            setSubmitLoading(false)
            navigate('/home')
            toast.success('Group archived successfully')
         }catch(err){
            console.log(err)
            toast.error("Something went wrong.")
            setSubmitLoading(false)
         }
      } 
   }

   const request = async() => {
      setSubmitLoading(true)

      try{
         const newRequest = auth.currentUser.uid
         const docRef = doc(db, 'groups', groupId)
   
         await updateDoc(docRef, {
            joinRequests: [ ...group.joinRequests, newRequest]
         })

         setSubmitLoading(false)
         toast.success(`Request submitted to join ${group.groupName}`)
      }catch(err){
         console.log(err)
         setSubmitLoading(false)
      }
   
      fetchGroup()
   }

   const approveRequest = async(memberId) => {
      setSubmitLoading(true)

      try{
         const newMember = memberId
         const newRequests = group.joinRequests.filter(userId => {
            return userId !== memberId
         })

         const docRef = doc(db, 'groups', groupId)
   
         await updateDoc(docRef, {
            members: [ ...group.members, newMember],  //Add to members array
            joinRequests: [...newRequests]          //delete from join requests array
         })

         //Update client
         const newPendingRequests = pendingMembers.filter(member => {
            return member.id !== memberId
         })
         setPendingMembers(newPendingRequests)

         setSubmitLoading(false)
         toast.success(`New member added to ${group.groupName}`)
         fetchGroup()
      }catch(err){
         console.log(err)
         setSubmitLoading(false)
      }
   
      fetchGroup()
   }

   const deleteMemberRequest = async(memberId) => {
      if(window.confirm("Are you sure you want to delete this member's request? ")){
         setSubmitLoading(true)

         try{
            const newRequests = group.joinRequests.filter(userId => {
               return userId !== memberId
            })
            const docRef = doc(db, 'groups', groupId)
            await updateDoc(docRef, {
               joinRequests: [...newRequests]
            })

            //Update client
            const newPendingRequests = pendingMembers.filter(member => {
               return member.id !== memberId
            })
            setPendingMembers(newPendingRequests)
   
            setSubmitLoading(false)
            toast.success('Member Request deleted')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
   
         fetchGroup()
      }
   }

   //Delete your own request
   const deleteRequest = async() => {
      if(window.confirm("Are you sure you want to delete your request to join this group? ")){
         setSubmitLoading(true)

         try{
            const newRequests = group.joinRequests.filter(userId => {
               return userId !== auth.currentUser.uid
            })
            const docRef = doc(db, 'groups', groupId)
      
            await updateDoc(docRef, {
               joinRequests: [...newRequests]
            })
   
            setSubmitLoading(false)
            navigate('/home')
            toast.info('Request deleted')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
   
         fetchGroup()
      }
   }

   const leaveGroup = async() => {
      if(window.confirm("Are you sure you want to leave this group? ")){
         setSubmitLoading(true)

         try{
            const newMembers = group.members.filter(member => {
               return member !== auth.currentUser.uid
            })
            const docRef = doc(db, 'groups', groupId)
      
            await updateDoc(docRef, {
               members: [...newMembers]
            })
   
            setSubmitLoading(false)
            navigate('/home')
            toast.info('You left the group')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
   
      }
   }

   const removeMember = async(memberId) => {
      if(window.confirm("Are you sure you want to remove this member from the group? ")){
         setSubmitLoading(true)

         try{
            const newMembers = group.members.filter(member => {
               return member !== memberId
            })
            const docRef = doc(db, 'groups', groupId)
      
            await updateDoc(docRef, {
               members: [...newMembers]
            })

            //Update client
            const newMembersFromGroup = members.filter(member => {
               return member.id !== memberId
            })
            setMembers(newMembersFromGroup)
   
            setSubmitLoading(false)
            fetchGroup()
            toast.success('Member removed from the group')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
      }
   }

   const joinGroup = async(room) => {
      setSubmitLoading(true)

      try{
         const newMember = auth.currentUser.uid
         const docRef = doc(db, 'groups', groupId)
   
         await updateDoc(docRef, {
            members: [ ...room.members, newMember]
         })

         setSubmitLoading(false)
         toast.success(`You joined ${group.groupName}`)
      }catch(err){
         console.log(err)
         setSubmitLoading(false)
      }
   
      fetchGroup()
   }

   const setAsPublic = async() => {
      if(window.confirm("Are you sure you want to set this group as public?")){
         setSubmitLoading(true)

         try{
            const docRef = doc(db, 'groups', groupId)
            const newMembers = group.joinRequests
      
            await updateDoc(docRef, {
               status: 'Public',
               members: [ ...group.members, ...newMembers],
               joinRequests: []
            })

            setSubmitLoading(false)
            toast.success('Your group is now public')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
      
         fetchGroup()
      }
   }

   const setAsPrivate = async() => {
      if(window.confirm("Are you sure you want to set this group as private?")){
         setSubmitLoading(true)

         try{
            const docRef = doc(db, 'groups', groupId)

            await updateDoc(docRef, {
               status: 'Private',
            })

            setSubmitLoading(false)
            toast.success('Your group is now private')
         }catch(err){
            console.log(err)
            setSubmitLoading(false)
         }
      
         fetchGroup()
      }
   }



   return (
      <>
         {
            submitLoading &&
            <FullSpinner />
         }
         {
            selectedGroup &&
            <EditGroupCoverModal 
               groupId={groupId}
               setSelectedGroup={setSelectedGroup}
               fetchGroup={fetchGroup}
            />
         }
         {
            selectedGroupLogo &&
            <EditGroupLogoModal 
               groupId={groupId}
               setSelectedGroupForLogo={setSelectedGroupForLogo}
               fetchGroup={fetchGroup}
            />
         }
         {
            addModal &&
            <AddPostModal 
               setAddModal={setAddModal}
               groupId={groupId}
               group={group}
               fetchPosts={fetchPosts}
               targetUser={targetUser}
            />
         }
         <div className='container pb-10'>
            <Navbar />

            {
               group && !loading ?
               <>
                 
                  <div className='back font-bold cursor-pointer' onClick={() => navigate(-1)}>
                     <BiArrowBack />
                     Back
                  </div>
              
                  <div className="profile-box room-box">
                     <div className="cover-photo-container">
                        {
                           group.coverPhotoURL !== "" ?
                           <img src={group.coverPhotoURL} alt="CoverPhoto" />
                           :
                           <></>
                        }
                        {
                           group.userRef === auth.currentUser.uid ?
                           <button onClick={() => setSelectedGroup(group)}>
                              <BsFillCameraFill />
                              <span>Edit Cover Photo</span> 
                           </button>
                           :
                           <></>
                        }
                     </div>
                     <div className="profile-box-bottom">
                        
                        <div className='profile-photo-wrapper'>
                           {
                              group.logoURL === "" ?
                              <div className="profile-photo-container default-container">
                                 { group.groupName[0].toUpperCase() }
                              </div>
                              :
                              <div className="profile-photo-container">
                                 <img src={group.logoURL} alt="Logo" />
                              </div>
                           }
                          {
                              group.userRef === auth.currentUser.uid ?
                              <div className="camera-container" onClick={() => setSelectedGroupForLogo(group)}>
                                 <BsFillCameraFill />
                              </div>
                              :
                              <></>
                           }
                        </div>
                     
                        <div className="profile-name room-name">
                           <div>
                              <h2>{group.groupName}</h2>
                              <small>{group.status} group ({ group.members.length} {group.members.length === 1 ? "member" : "members"})</small>
                              {
                                 users && users.map(user => (
                                    <Fragment key={user.id}>
                                       {
                                          user.id === group.userRef ? 
                                          <>
                                             {
                                                user.id === auth.currentUser.uid ?
                                                <div>
                                                   <small>You created this group</small>
                                                </div>
                                                :
                                                <div>
                                                   <small>Created by: 
                                                      <Link to={
                                                         user.id === auth.currentUser.uid ? 
                                                         `/profile` :
                                                         `/people/${user.id}`
                                                      }
                                                         className="decoration-none text-primary font-bold ml-6px"
                                                      >
                                                         {user.data.name}
                                                      </Link>  
                                                   </small>
                                                </div>
                                             }
                                          </>
                                          :
                                          <></>
                                       }
                                    </Fragment>
                                 ))
                              }
                           </div>
                           {
                              group.members.includes(auth.currentUser.uid) ?
                              <button className='joined room-btn'>Joined</button>
                              :
                              <>
                                 {
                                    group.status === 'Private' ?
                                    <>
                                       {
                                          group.joinRequests.includes(auth.currentUser.uid) ?
                                          <button className="requested room-btn">Requested</button>
                                          :
                                          <button className="room-btn" onClick={() => request(group)}>Request to join</button>
                                       }
                                    </>
                                    :
                                    <button className="room-btn" onClick={() => joinGroup(group)}>Join</button>
                                 }
                                 
                              </>
                           }
                           
                           {/* Actions  */}
                           
                           {
                              group.userRef !== auth.currentUser.uid ? 
                              <>
                                 <div className="room-actions">
                                    {
                                       group.status === "Private" && group.joinRequests.includes(auth.currentUser.uid) ?
                                       <div onClick={deleteRequest}>Delete Request</div>
                                       :
                                       <></>
                                    }
                                    {
                                    group.members.includes(auth.currentUser.uid) ?
                                       <div onClick={leaveGroup}>Leave group</div>
                                       :
                                       <></>
                                    }
                                 </div>
                              </>
                              :
                              <div className="room-actions">
                                 {
                                    group.status === "Private" && group.joinRequests.includes(auth.currentUser.uid) ?
                                    <div onClick={deleteRequest}>Delete Request</div>
                                    :
                                    <></>
                                 }
                                 <div onClick={archiveGroup}>Archive group</div>
                                 {
                                    group.members.includes(auth.currentUser.uid) ?
                                    <div onClick={leaveGroup}>Leave group</div>
                                    :
                                    <></>
                                 }
                              
                                 {
                                    group.status === "Public" ?
                                    <div onClick={setAsPrivate}>Set as Private</div>
                                    :
                                    <div  onClick={setAsPublic}>Set as Public</div>
                                 }
                              </div>
                           }
                           
                        </div>
                     </div>
                  </div>  

                  {
                     group.members.includes(auth.currentUser.uid) ?
                     <>
                        <div className="profile-tabs-header">
                           <div className={`tab-header-1 ${tab === 1 ? "active-tab" : ""}`} onClick={() => changeTab(1)}>Posts</div>
                           <div className={`tab-header-2 ${tab === 2 ? "active-tab" : ""}`} onClick={() => changeTab(2)}>Members</div>
                           {
                              group.status === "Private" && group.userRef === auth.currentUser.uid ?
                              <div className={`tab-header-4 ${tab === 3 ? "active-tab" : ""}`} onClick={() => changeTab(3)}>Join Requests</div>
                              :
                              <></>
                           }

                           {
                              group.userRef === auth.currentUser.uid ?
                              <div className={`tab-header-6 ${tab === 4 ? "active-tab" : ""}`} onClick={() => changeTab(4)}>Archived Posts</div>
                              :
                              <></>
                           }
                        </div>

                        {
                           tab === 1 ?
                           <div>
                              <div className='flex items-center justify-between'>
                                 <h3 className='text-dark'>Posts </h3>
                                 <button className='share-btn btn' onClick={() => setAddModal(true)}>Create a post</button>
                              </div>

                              {
                                 posts && !postsLoading ?
                                 <>
                                    { posts.length > 0 ?
                                       <div className="mt-1">
                                          {
                                             posts.map(post => (
                                                <div key={post.id} className="mt-1">
                                                   <PostItem 
                                                      post={post}
                                                      fetchPosts={fetchPosts}
                                                      group={group}
                                                      archived={false}
                                                   />
                                                </div>
                                             ))
                                          }
                                       </div>
                                       :
                                       <div className='mt-1'>
                                          <p>There are no posts here yet.</p>
                                       </div>
                                    }
                                 </>
                                 :
                                 <Spinner />
                              }
                           </div>
                           :tab === 2 ?
                           <div>
                              Members
                              <div className='blog-container mt-1'>
                              { 
                                 members && members.length > 0 ?
                                 <>
                                    {
                                       members.map(member => (
                                          <div key={member.id}>
                                             <MemberCard 
                                                member={member}
                                                removeMember={removeMember}
                                                group={group}
                                             />
                                          </div>
                                       ))
                                    }
                                 </>
                                 :
                                 <div>No members here yet</div>
                              }
                              </div>
                           </div>
                           :tab === 3 ?
                           <>
                           <div className="mb-1">Requests: {pendingMembers && pendingMembers.length} </div>
                              <div className='blog-container'>
                                 { 
                                    pendingMembers && pendingMembers.length > 0 ?
                                    <>
                                       {
                                          pendingMembers.map(member => (
                                             <div key={member.id}>
                                                <JoinRequestCard
                                                   member={member}
                                                   deleteMemberRequest={deleteMemberRequest}
                                                   approveRequest={approveRequest}
                                                   group={group}
                                                />
                                             </div>
                                          ))
                                       }
                                    </>
                                    :
                                    <div>No requests here yet</div>
                                 }
                              </div>
                           </>
                           :
                           <div>
                              {
                                 archivedPosts && !postsLoading ?
                                 <>
                                    <h3 className='mt-2'>Archived Posts</h3>
                                    { archivedPosts.length > 0 ?
                                       <div className="mt-1">
                                          {
                                             archivedPosts.map(post => (
                                                <div key={post.id} className="mt-1">
                                                   <PostItem 
                                                      post={post}
                                                      fetchPosts={fetchPosts}
                                                      group={group}
                                                      archived={true}
                                                   />
                                                </div>
                                             ))
                                          }
                                       </div>
                                       :
                                       <div className='mt-1'>
                                          <p>There are no archived posts here yet.</p>
                                       </div>
                                    }
                                 </>
                                 :
                                 <Spinner />
                              }
                           </div>
                        }
                     </>
                     :
                     <div className="mt-1">
                        <small> You're not a member yet. Join this group to view posts</small>
                     </div>
                  }
               </>
               :
               <Spinner />
            }
         </div>
      </>
   )
}

export default Group