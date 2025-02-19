import React, { useState, Fragment } from 'react';
import Index from './index';
import { TfiReload } from "react-icons/tfi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import {  Row } from 'react-bootstrap'
import downloadPDF from '../../Downloads/PDF';
import '../../Reports/styless.css';

const Dashboard = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };

  return (
    <Fragment>
      <Row>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              width: 'calc(100% - 40px)', 
              maxWidth: '100%', 
              padding: '10px',
              boxSizing: 'border-box',
              marginLeft: '12px'
            }} 
            className="form-title"
          >
            <h5 style={{ margin: 0 }}>Home Dashboard</h5>
            <div>
            <FontAwesomeIcon icon={faDownload} onClick={downloadPDF} style={{color: "white",cursor: "pointer", fontSize: "20px", marginTop:'8px', marginRight:'15px'}} />
            <FontAwesomeIcon 
              icon={faRotateRight} 
              onClick={reloadComponent} 
              style={{ color: "white", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
            />
            </div>
          </div>
        </Row>
        <Index key={key} />
    </Fragment>
  );
};

export default Dashboard;