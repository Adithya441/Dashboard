import React, { Fragment, useState} from 'react';
import {Row} from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import FirmwareUpgrade from './FirmwareUpgrade';

const FirmwareUpgradereload = ({meternum}) => {
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
            justifyContent: 'flex-end',  // Ensures button stays on the right
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '100%', 
            minHeight: '40px',  // Prevents collapse
            padding: '5 px',    // Adds spacing
            }} 
        >
            <FontAwesomeIcon 
            icon={faRotateRight} 
            onClick={reloadComponent} 
            style={{ 
                color: "black", 
                cursor: 'pointer', 
                fontSize: '19px', 
                marginRight: '15px' 
            }} 
            />
        </div>
        </Row>
        <FirmwareUpgrade key={key} meternum={meternum} />
      </Fragment>
  )
}

export default FirmwareUpgradereload