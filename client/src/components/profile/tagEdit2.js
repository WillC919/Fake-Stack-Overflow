import { useEffect, useState } from 'react';
import axios, { Axios } from 'axios';

export default function TagEdit2({setPageIndex, tagId}) {
    const [tagName, setTagName] = useState('')
    useEffect(() => {
        async function fetchTagName() {
            try {
                let tagName = await Axios.get(`http://localhost:8000/tag/tid/:${tagId}`);
                setTagName(tagName.data.name);
            } catch (err) {
                console.log('Cannot fetch tagname');
            }
        }

        fetchTagName();
    })
    return (
        <form onSubmit={(e) => editTag(e, tagId, setPageIndex)}>
            <label htmlFor="tagname">Edit Tag Name:</label>
            <input type="text" id="tagname" name="tagname" defaultValue={tagName}/>
            <input type="submit" value="Submit"/>
        </form> 
    );
}

function editTag(e, tagId, setPageIndex){
    e.preventDefault();
    let tag = e.target.tagname.value;
    let valid = true;
    if (tag.length === 0) {
        valid = false;
        alert(">> Needs tag!!");
    } else if (tag.length > 10) { 
        valid = false;
        alert(">>Tag must not be longer than 10 characters!!");
    } else if (tag.indexOf(' ') > -1) {
        valid = false;
        alert(">>Tag must be one-word, use dash instead of space!!")
    }
    
    if(valid) {
        try{
            axios.post(`http://localhost:8000/edittag/:${tagId}`,  {name: tag}).then( res => {
                // setTagsData()
                console.log(res)
                alert('successful');
                setPageIndex(7)
            })
            .catch(err => {console.log(err);});
    
        } catch (error) {
            console.log(error);
        }
    }else{
        alert('check requirements of tag');
    }
}