import React, { useState} from 'react';
import NonCommunicationreport from './NonCommunicationReport.js';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import './styless.css';

const NonCommunicationreload = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };

  return (
    <div>
      <div>
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
          <h5 style={{ margin: 0 }}>Non Communication Report</h5>
          <FontAwesomeIcon 
            icon={faRotateRight} 
            onClick={reloadComponent} 
            style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
          />
        </div>
      </Row>
        <NonCommunicationreport key={key} />
      </div>
    </div>
  )
}

export default NonCommunicationreload