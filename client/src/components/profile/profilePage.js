// import axios from "axios";
import { useState } from "react";
import Admin from "./profileAdmin.js";
import User from "./profileUser.js";
import '../../stylesheets/profilePage.css'

export default function Profile({userData, setPageIndex, setQuestionId, setFromProfile, subUser, setSubUser, isSubuser, setIsSubuser}) {
    // const [subUser, setSubUser] = useState(null);

    if (subUser !== null) {setIsSubuser(true)}

    return ( 
        userData.accType === "Admin" && subUser === null ? 
            <Admin userData = {userData} setSubUser={setSubUser} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile}/>
            : userData.accType === "Admin" && subUser ? 
                <User userData = {subUser} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile} setSubUser = {setSubUser} isSubuser = {isSubuser}/>
                : userData.accType === 'User' && subUser === null ?
                    <User userData = {userData} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile} setSubUser = {setSubUser} isSubuser = {isSubuser}/>
                    : userData !== 'Admin' && userData !== 'User' ?
                        <h1>Please login or signup</h1>
                        :<h1> Unable to load User profile </h1>
    );
}
