import React from 'react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useEffect } from 'react';

const encryptData = (data) => {
    const encrypted = CryptoJS.AES.encrypt(data, 'my-key').toString();
    return encodeURIComponent(encrypted);
  };
const AlarmNameLinkRender=({value,id})=>{
    const encryptedAlarmCode= encryptData(id);
    const encryptedAlarmName= encryptData(value);
  useEffect(()=>{
    console.log(`props:${id},${value}`);
  },[]);
    return(
      <Link to={`/alarmmasterupdate/${encryptedAlarmName}/${encryptedAlarmCode}`} style={{color: 'blue'}}>
        {value}
      </Link>
    );
  }

export default AlarmNameLinkRender;