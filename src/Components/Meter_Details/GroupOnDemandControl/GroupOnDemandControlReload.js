import React, { Fragment, useState } from 'react';
import GroupOnDemandControl from './GroupOnDemand';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Row } from 'react-bootstrap';
import '../../Reports/styless.css';
 
const GroupOnDemandControlreload = () => {
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
          <h5 style={{ margin: 0 }}>Group On Demand Screen</h5>
          <FontAwesomeIcon 
            icon={faRotateRight} 
            onClick={reloadComponent} 
            style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
          />
        </div>
      </Row>
        <GroupOnDemandControl key={key}/>
    </Fragment>
  );
};
 
export default GroupOnDemandControlreload;
 