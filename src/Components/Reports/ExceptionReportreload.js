import { Fragment, useState } from "react";
import {  Row,Col,Container,Form } from 'react-bootstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import ExceptionReport from "./ExceptionReport.js";
 
const Exceptionreportreload = () => {
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
          <h5 style={{ margin: 0 }}>Exception Report</h5>
          <FontAwesomeIcon 
            icon={faRotateRight} 
            onClick={reloadComponent} 
            style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginRight: '15px' }} 
          />
        </div>
      </Row>
    <Form>
      <ExceptionReport key={key} />
    </Form>
  </Fragment>
 
);
}
 
export default Exceptionreportreload;
 