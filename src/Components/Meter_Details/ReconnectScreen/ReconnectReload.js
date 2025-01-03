import React, { useState } from 'react';
import Reconnect from './Reconnect';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faRotateRight } from "@fortawesome/free-solid-svg-icons";
// import downloadPDF from './Download/PDF.js'
 
const Reconnectreload = () => {
  const [key, setKey] = useState(0);
 
  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };
 
  return (
    <div>
        <div style={{direction:'rtl'}}>
            <FontAwesomeIcon icon={faRotateRight} onClick={reloadComponent} style={{color: "#070b12", cursor: 'pointer',fontSize:'19px', marginLeft:'15px'}} />
        </div>
        <Reconnect key={key} />
    </div>
  );
};
 
export default Reconnectreload;
 