import {Container,Row,Col,Button,Form,InputGroup} from "react-bootstrap";
import  { useState } from "react";

function ActivationConfiguration({onCancel,tabKey,parentTab,jsonData }){
  const [date, setDate] = useState("");
  const handleCancelClick = () => {
    onCancel(tabKey,parentTab ); 
  };
   console.log(jsonData)
    return(
        <div>
            <Form>
            <Row>
            <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span>Date
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center gap-5 mt-5">
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} >
            Save
          </button>
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={handleCancelClick}>
            Back
          </button>
          </div>
            </Form>
        </div>
    )
}
export default ActivationConfiguration