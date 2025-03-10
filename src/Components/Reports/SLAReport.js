import { Fragment, useState } from 'react';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import ReLoadSLAReport from './ReLoadSLAReport';
import '../Reports/styless.css';
 
const SLAReport = () => {
  const [key, setKey] = useState(0);
 
  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1);
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
          <h5 style={{ margin: 0 }}>SLA REPORT</h5>
          <FontAwesomeIcon
            icon={faRotateRight}
            onClick={reloadComponent}
            style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }}
          />
        </div>
      </Row>
      <ReLoadSLAReport key={key} />
    </Fragment>
  );
}
 
export default SLAReport;