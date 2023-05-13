import '../stylesheets/fsoHeader.css';
import axios from 'axios';

export default function Header({userData, setUserData, setQuestsData, setPageIndex}) {
    return (
        <div id="header">
            <div id="banner">
                <h1> Fake Stack Overflow </h1>
                <input type="text" id="searchbar" name='searchbar' onKeyDown={e => search(e, setQuestsData, setPageIndex)}></input>
            </div>
        </div>
    );
}

function search(event, setQuestsData, setPageIndex) {
    if (event.key === 'Enter') {
        const set = event.target.value;
        let keys = "";
        for (let i = 0; i < set.length; i++) {
            if (set.charAt(i) === "[") {
                keys += " [";
            } else if (set.charAt(i) === "]") {
                keys += "] ";
            } else {
                keys += set.charAt(i);
            }
        }

        keys = keys.split(' ');
        const keywords = keys.filter((str) => str !== '' && str.charAt(0) !== '[' && str.charAt(str.length-1) !== ']');
        const keytags = keys.filter((str) => str.charAt(0) === '[' && str.charAt(str.length-1) === ']');

        axios.post('http://localhost:8000/find', { wordKeys: keywords, tagKeys: keytags }).then(res => {
            setQuestsData(res.data);
            setPageIndex(5);
        });
    }
}

function logout() {
    axios.post('http://localhost:8000/logout').then(res => {
        if (res.status === 400){
            console.log('error')
        } else console.log('yes')
    })
}