import Home from './fsoHome.js'
import Login from './fsoLogin.js'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FakeStackOverflow() {
  const [userData, setUserData] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/cookie', { credentials: 'include',}).then(response => {
      if (response.ok) { return response.json(); } 
      else { throw "Error"; }
    }).then(data => { setUserData(data);})
      .catch(error => { console.log(error);});
  }, []);

  return (
    <>
      {(userData.length !== 0) ? <Home userData = {userData}/> : <Login setUserData = {setUserData}/>}
    </>
  ); 
}