import axios from 'axios';
import { useState } from 'react';
import '../stylesheets/fsoLogin.css'
//onSubmit={(e) => handleClick(e, displayIndex, setDisplayIndex, setUserData)}
//The Welcome / Login Page
export default function LoginPage({displayIndex, setDisplayIndex, setUserData}) {
    return (<>
        {(displayIndex === 0) &&
        <div id="wrapper">
            <h1 style={{textAlign: "center"}}>Weclome to FakeStackOverflow</h1>
            <hr/>
            <div id="container">
                <div className="infoBox">
                    <h2>Log into an Account</h2>
                    <p>Have an account? Log in and start browsing again.</p>
                    <div className='btn'><button id="Login" onClick={() => {setDisplayIndex(1)}}>Login</button></div>
                </div>
                <div className="infoBox">
                    <h2>Register an Account</h2>
                    <p>Don't have an account? Sign up with us so you can get notified.</p>
                    <div className='btn'><button id="Sign Up" onClick={() => {setDisplayIndex(2)}}>Sign Up</button></div>
                </div>
                <div className="infoBox">
                    <h2>Browse as Guest</h2>
                    <p>Just want to browse around the website. No problem.</p>
                    <div className='btn'><button id="Guest" onClick={() => setUserData({user: 'Anonymous', accType: 'Guest'})}>Guest</button></div>   
                </div>
            </div>
        </div>}

        { (displayIndex === 1) &&
        <div className="login">
            <h1>Log in Page</h1>
            <hr/>
            <form id="login" name="login"  action="http://localhost:8000/login" method="post" onSubmit={(e) => handleClick(e, displayIndex, setDisplayIndex)}> 
            <div className="row">
                <div className="logUser"><label htmlFor="loginEmail">Email</label></div>
                <div className="logResp">
                    <input type="text" id="loginEmail" name="loginEmail" placeholder="Email" required></input>
                </div>
                <p className="invalidText" id="loginEmailError"></p>
            </div>

            <div className="row">
                <div className="logUser"><label htmlFor="loginPassword">Password</label></div>
                <div className="logResp">
                    <input type="password" id="loginPassword" name="loginPassword" placeholder="Password" required></input>
                </div>
                <p className="invalidText" id="loginPasswordError"></p>
            </div>

            <div className="row" id="lastRow">
                <input className="loginOrUpBtn" id="loginButton" type="Submit" defaultValue="Login"></input>
                <p className="invalidText" id="signInError"></p>
            </div>
            </form>
        </div>
        }

        { (displayIndex === 2) &&
        <div className='login'>
            <h1>Sign Up Page</h1>
            <hr/>
            <form id='signup' name="signup" action="http://localhost:8000/addUser" method="post" onSubmit={(e) => handleClick(e, displayIndex, setDisplayIndex)}> 
            <div className="row">
                <div className="logUser"><label htmlFor="signUpUsername">Username</label></div>
                <div className="logResp">
                    <input type="text" id="signUpUsername" name="signUpUsername" placeholder="Username" required></input>
                </div>
                <p className="invalidText" id="signUpUsernameError"></p>
            </div>

            <div className="row">
                <div className="logUser"><label htmlFor="signUpEmail">Email</label></div>
                <div className="logResp">
                    <input type="text" id="signUpEmail" name="signUpEmail" placeholder="Email" required></input>
                </div>
                <p className="invalidText" id="signUpemailError"></p>
            </div>

            <div className="row">
                <div className="logUser"><label htmlFor="signUpPassword">Password</label></div>
                <div className="logResp">
                    <input type="password" id="signUpPassword" name="signUpPassword" placeholder="Password" required></input>
                </div>
                <p className="invalidText" id="signUppasswordErrorA"></p>
            </div>
            
            <div className="row">
                <div className="logUser"><label htmlFor="signUpVerPassword">Verify Password</label></div>
                <div className="logResp">
                    <input type="password" id="signUpVerPassword" name="signUpVerPassword" placeholder="Password" required></input>
                </div>
                <p className="invalidText" id="signUppasswordErrorB"></p>
            </div>
            
            <div className="row" id="lastRow">
                <input className="loginOrUpBtn" id="signUpButton" type="Submit" defaultValue="Sign Up"></input>
                {/* <p style={{color: 'red'}}>*Indicates mandatory fields</p> */}
            </div>
            </form>
        </div>
        }
    </>); 
}

async function handleClick(event, displayIndex) {
  event.preventDefault();
  if (displayIndex === 1) {
    const email = event.target.loginEmail.value.toLowerCase();
    const password = event.target.loginPassword.value;
    const resp = await axios.post('http://localhost:8000/verify', { email: email, password: password });
    console.log(resp.data);
    
    if (resp.data) { 
        document.getElementById("signInError").innerText = ""; 
        event.target.submit();
    } else {
        document.getElementById("signInError").innerText = ">> Email or password is incorrect!!"; 
    }
  } else {
    const username = event.target.signUpUsername.value;
    const email = event.target.signUpEmail.value.toLowerCase();
    const passwordA = event.target.signUpPassword.value;
    const passwordB = event.target.signUpVerPassword.value;
    
    let valid = true;
    if (username.length === 0) {
        valid = false;
        document.getElementById("signUpUsernameError").innerText = ">> You need a username!!";
    } else if (username.length > 15) {
        valid = false;
        document.getElementById("signUpUsernameError").innerText = ">> Users excceeds 15 character limit!!";
    } else { document.getElementById("signUpUsernameError").innerText = ""; }
    
    if (email.length === 0) {
        valid = false;
        document.getElementById("signUpemailError").innerText = ">> Need an Email!!";
    } else { 
        const txtErrMsg = checkIfValidEmail(email);
        if (txtErrMsg !== "") {
            valid = false;
            document.getElementById("signUpemailError").innerText = txtErrMsg; 
        } else {
          const response = await axios.get(`http://localhost:8000/user/:${email}`);
          valid = !(response.data);
          if (!valid) document.getElementById("signUpemailError").innerText = 'This email is already taken!!';
          else document.getElementById("signUpemailError").innerText = '';
        }
    }

    if (passwordA.length < 8 || passwordA.length > 30) {
        valid = false;
        document.getElementById("signUppasswordErrorA").innerText = ">> Password must have a length between 8-30!!";
    } else if (passwordA.indexOf(username) > -1 || passwordA.indexOf(email.split('@')[0]) > -1) {
        valid = false;
        document.getElementById("signUppasswordErrorA").innerText = ">> Password must not contain Username or Email ID!!";
    } else {
        document.getElementById("signUppasswordErrorA").innerText = "";
    }
          
    if (passwordB !== passwordA) {
        valid = false;
        document.getElementById("signUppasswordErrorB").innerText = ">> Passwords doesn't match!!";
    } else {
        document.getElementById("signUppasswordErrorB").innerText = "";
    }

    if (valid) { event.target.submit(); }
  }
}

function checkIfValidEmail(email) {
  let validRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (validRegex.test(email)) { return ""; } 
  return ">> Not a vaild email!!";
}