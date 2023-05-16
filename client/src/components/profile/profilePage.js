// import axios from "axios";
import { useState } from "react";
import Admin from "./profileAdmin.js";
import User from "./profileUser.js";
import '../../stylesheets/profilePage.css'

export default function Profile({userData, setPageIndex, setQuestionId, setFromProfile}) {
    const [subUser, setSubUser] = useState(null);

    return ( 
        userData.accType === "Admin" && subUser === null ? 
            <Admin userData = {userData} setSubUser={setSubUser} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile}/>
            : userData.accType === "User" || subUser ? 
                <User userData = {userData} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile}/>
                : <h1> Unable to load User profile </h1>
    );
}
