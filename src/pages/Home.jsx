import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import AddGroupModal from '../components/AddGroupModal'
import Groups from '../components/Groups'
import { BsSearch } from 'react-icons/bs'
import Spinner from '../components/Spinner'

import { useAllGroups } from '../hooks/useAllGroups'

import './styles/Home.scss'

function Home() {
  const [roomModal, setRoomModal] = useState(false)

  const text = useRef()

  const [filteredGroups, setFilteredGroups] = useState(null)
  const { groups, fetchGroups, loading } = useAllGroups()
 
  const filterChange = () => {
      if(text.current.value !== ''){
          const filteredGroups = groups.filter((group) => {
            const regex = new RegExp(`^${text.current.value}`, 'gi')
            return group.data.groupName.match(regex)
          })
          setFilteredGroups(filteredGroups)
      }else{
        setFilteredGroups(null)
      }
  }

  useEffect(() => {
     // 👇️ scroll to top on page load
     window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
   }, []);

  return (
    <>
      {
        roomModal &&
        <AddGroupModal 
          setRoomModal={setRoomModal}
        />
      }
      <div className='container pb-10'>
        <Navbar />

        <div className='mt-3'>
          <div className="flex items-center justify-between">
            <h2 className='text-dark'>Home</h2>
            <button className='btn btn-primary' onClick={() => setRoomModal(true)}>
              Create a group
            </button>
          </div>
        </div>

        <div>
            {
              groups && !loading ?
              <>
                  <div className='filterInputDiv mt-1'>
                    <input 
                        type="text" 
                        name="filter" 
                        id="filter" 
                        className='filterInput' 
                        placeholder='Search for groups'
                        ref={text}
                        autoComplete="off"
                        onChange={filterChange}
                    />                        
                    <BsSearch className='search-icon'/>
                  </div>
                  <div>
                    {
                      filteredGroups !== null ?
                      <>
                        {
                          filteredGroups.length > 0 ?
                          <Groups 
                            groups={filteredGroups}
                            fetchGroups={fetchGroups}
                          />
                          :
                          <p>No groups matches your search...</p>
                        }
                      </>
                     
                      :
                      <>
                        {
                          groups.length > 0 ?
                          <Groups 
                            groups={groups}
                            fetchGroups={fetchGroups}
                          />
                          :
                          <p>No groups to see here yet...</p>
                        }
                      </>
                      
                    }
                    
                  </div>
              </>
              :
              <Spinner />
            }
        </div>
      </div>
    </>
  )
}

export default Home