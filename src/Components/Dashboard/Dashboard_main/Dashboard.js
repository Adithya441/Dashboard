import React, { useState } from 'react';
import Index from './index';
import { TfiReload } from "react-icons/tfi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import downloadPDF from '../../Downloads/PDF';

const Dashboard = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };

  return (
    <div style={{padding:'5px 5px'}}>
        <div style={{direction:'rtl'}}>
            <FontAwesomeIcon icon={faRotateRight} onClick={reloadComponent} style={{color: "#070b12", cursor: 'pointer',fontSize:'19px', marginLeft:'15px'}} />
            <FontAwesomeIcon icon={faDownload} onClick={downloadPDF} style={{color: "#03ab8f",cursor: "pointer", fontSize: "20px", marginTop:'8px'}} />
        </div>
        <Index key={key} />
    </div>
  );
};

export default Dashboard;