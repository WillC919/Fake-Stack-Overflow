import axios from 'axios';
import { useState } from 'react';
import '../stylesheets/fsoLogin.css'

//The Welcome / Login Page
export default function LoginPage() {
    const [displayIndex, setDisplayIndex] = useState(0);

    return (<>
        {(displayIndex === 0) &&
        <div>
            <button id="Login" onClick={() => {setDisplayIndex(1)}}>Login</button>
            <button id="Sign Up" onClick={() => {setDisplayIndex(2)}}>Sign Up</button>
            <button id="Guest" onClick={() => {
                //Create Guest Cookie
                setDisplayIndex(3);
            }}>Guest</button>
        </div> 
        }

        { (displayIndex === 1) &&
        <div className='login'>
            <h1>Log in Page</h1>
            <hr/>
            <form id='login' name="login" onSubmit={(e) => handleClick(e, displayIndex, setDisplayIndex)}> 
            <div className="row">
                <div className="logUser"><label htmlFor="loginEmail">Username</label></div>
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
                <input id="loginButton" type="Submit" defaultValue="Login"></input>
                <p className="invalidText" id="signInError"></p>
            </div>
            </form>
        </div>
        }

        { (displayIndex === 2) &&
        <div className='login'>
            <h1>Sign Up Page</h1>
            <hr/>
            <form id='signup' name="signup" onSubmit={(e) => handleClick(e, displayIndex, setDisplayIndex)}> 
            <div className="row">
                <div className="logUser"><label htmlFor="signUpUsername">Username</label></div>
                <div className="logResp">
                    <input type="text" id="signUpUsername" name="signUpUsername" placeholder="Username" value="TestSubA" required></input>
                </div>
                <p className="invalidText" id="signUpUsernameError"></p>
            </div>

            <div className="row">
                <div className="logUser"><label htmlFor="signUpEmail">Email</label></div>
                <div className="logResp">
                    <input type="text" id="signUpEmail" name="signUpEmail" placeholder="Email" value="TestSubA@email.dom" required></input>
                </div>
                <p className="invalidText" id="signUpemailError"></p>
            </div>

            <div className="row">
                <div className="logUser"><label htmlFor="signUpPassword">Password</label></div>
                <div className="logResp">
                    <input type="password" id="signUpPassword" name="signUpPassword" placeholder="Password" value="testing123" required></input>
                </div>
                <p className="invalidText" id="signUppasswordErrorA"></p>
            </div>
            
            <div className="row">
                <div className="logUser"><label htmlFor="signUpVerPassword">Verify Password</label></div>
                <div className="logResp">
                    <input type="password" id="signUpVerPassword" name="signUpVerPassword" placeholder="Password." value="testing123" required></input>
                </div>
                <p className="invalidText" id="signUppasswordErrorB"></p>
            </div>
            
            <div className="row" id="lastRow">
                <input id="signUpButton" type="Submit" defaultValue="Sign Up"></input>
                {/* <p style={{color: 'red'}}>*Indicates mandatory fields</p> */}
            </div>
            </form>
        </div>
        }
    </>); 
}

async function handleClick(event, displayIndex, setDisplayIndex) {
  event.preventDefault();

  if (displayIndex === 1) {
    const email = event.target.loginEmail.value;
    const password = event.target.loginPassword.value;
    const resp = axios.post('http://localhost:8000/login', { email: email, password: password });

    if (!resp) document.getElementById("signInError").innerText = ">> Email or password is incorrect!!";
    else document.getElementById("signInError").innerText = "";
    setDisplayIndex(0);
    
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

    if (valid) {
      axios.post('http://localhost:8000/addUser', {
          email: email,
          user: username,
          password: passwordA,
      }).then(res => {
        setDisplayIndex(0);
      }).catch(err => { console.log(err); })
    }
  }
}

function checkIfValidEmail(email) {
  let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(validRegex)) { return ""; } 
  return ">> Not a vaild email!!";
}