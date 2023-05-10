import Home from './fsoHome.js'
import Login from './fsoLogin.js'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FakeStackOverflow() {
  const [userData, setUserData] = useState([]);

  useEffect(() => { 
    axios.get('http://localhost:8000/').then(res => { console.log(res); setUserData(res.data); });
  }, []);
  
  return (
    <>
      {(userData.length !== 0) ? <Home userData = {userData}/> : <Login/>}
    </>
  ); 
}