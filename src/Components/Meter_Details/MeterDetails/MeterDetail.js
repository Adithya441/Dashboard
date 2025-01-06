import React, { useState} from 'react';
import Metertabs from './Metertabs';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

const MeterDetails = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1); // Increment the key to force remount
  };

  return (
    <div>
      <div>
        <div style={{direction:'rtl'}}>
          <FontAwesomeIcon icon={faRotateRight} onClick={reloadComponent} style={{color: "#070b12", cursor: 'pointer',fontSize:'19px', margin:'10px'}} />
        </div>
        <Metertabs key={key} />
      </div>
    </div>
  )
}

export default MeterDetails
