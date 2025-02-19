import React, { useState, Fragment } from 'react';
import Reconnect from './Reconnect';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Row } from 'react-bootstrap';
import '../../Reports/styless.css';
 
const Reconnectreload = () => {
  const [key, setKey] = useState(0);
 
  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };
 
  return (
    <Fragment style={{padding:'5px 5px'}}>
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
          <h5 style={{ margin: 0 }}>Reconnect Screen</h5>
          <FontAwesomeIcon 
            icon={faRotateRight} 
            onClick={reloadComponent} 
            style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
          />
        </div>
      </Row>
        <Reconnect key={key} />
    </Fragment>
  );
};
 
export default Reconnectreload;
 