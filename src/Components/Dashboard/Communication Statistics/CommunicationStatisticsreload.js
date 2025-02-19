import React, { useState, useCallback, Fragment } from 'react';
import CommunicationStatisticsmain from './CommunicationStatistics';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import {  Row } from 'react-bootstrap'
import '../../Reports/styless.css';
 
const CommunicationStatistics = () => {
  const [key, setKey] = useState(0);
 
  const reloadComponent = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);
 
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
            <h5 style={{ margin: 0 }}>Communication Statistics</h5>
            <div>
            <FontAwesomeIcon 
              icon={faRotateRight} 
              onClick={reloadComponent} 
              style={{ color: "white", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
            />
            </div>
          </div>
        </Row>
      <CommunicationStatisticsmain key={key} />
    </Fragment>
  );
};
 
export default CommunicationStatistics;