import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
//Pages
import Signin from './pages/Signin'
import Signup from './pages/Signup';
import Home from './pages/Home';
import Group from './pages/Group';
import Post from './pages/Post';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import People from './pages/People';
import ViewProfile from './pages/ViewProfile';
import Notifications from './pages/Notifications';

import './App.scss'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={ <Signin /> }/>
          <Route path="/signup" element={ <Signup /> }/>
          <Route path="/forgot-password" element={ <ForgotPassword /> } />

          <Route path="/home" element={<PrivateRoute />}>
            <Route path="/home" element={ <Home /> } />
            <Route path="/home/:groupId" element={ <Group /> } />
            <Route path="/home/post/:postId" element={ <Post /> }/>
          </Route>

          <Route path="/profile" element={<Profile /> } />
          <Route path="/people" element={ <People />} />
          <Route path="/people/:userId" element={ <ViewProfile />} />

          <Route path="/notifications" element={ <Notifications /> } />

        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
