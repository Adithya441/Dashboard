import React, { useState, useCallback } from 'react';
import TransactionLog from './Transactionlog';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
 
const TransactionLogcontrol = () => {
  const [key, setKey] = useState(0);
 
  const reloadComponent = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);
 
  return (
    <div>
      {/* <div style={{direction:'rtl'}}>
        <FontAwesomeIcon 
          icon={faRotateRight} 
          onClick={reloadComponent} 
          style={{
            color: "#070b12", 
            cursor: 'pointer',
            fontSize:'19px', 
            margin:'10px'
          }} 
        />
      </div> */}
      <TransactionLog key={key} />
    </div>
  );
};
 
export default TransactionLogcontrol;