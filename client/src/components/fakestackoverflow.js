import Home from './fsoHome.js'
import Login from './fsoLogin.js'
import { useState, useEffect } from 'react';

export default function FakeStackOverflow() {
  const [userData, setUserData] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/cookie', { credentials: 'include',}).then(response => {
      if (response.ok) { return response.json(); } 
      else { throw "Error"; }
    }).then(data => { setUserData(data);})
      .catch(error => { console.log(error);});
  }, []);

  return (
    <>
      {(userData.length !== 0) 
        ? <Home userData = {userData} setUserData = {setUserData}/> 
        : <Login displayIndex = {displayIndex} setDisplayIndex = {setDisplayIndex} setUserData = {setUserData}/>
      }
    </>
  ); 
}