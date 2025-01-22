import { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Col, Button, Container, Row ,InputGroup} from 'react-bootstrap';
import CryptoJS from 'crypto-js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

const EventUpdate = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1);
  };
  const ReLoadCmp = () => {
    const [eventCode, setEventCode] = useState();
    const [eventName, setEventName] = useState();
    const [eventDesc, setEventDesc] = useState();
    const [eventType,setEventType]=useState();
    const navigate=useNavigate();
    //Navigation Handling
    const handleClick=()=>{
      navigate('/eventmaster');
    }
    //Decryption of Params
    const { encryptedEventName, encryptedEventCode } = useParams();
    const decryptData = (encryptedData) => {
      if (!encryptedData) {
        console.error('No encrypted data provided.');
        return null;
      }

      try {
        const decodedData = decodeURIComponent(encryptedData);
        const bytes = CryptoJS.AES.decrypt(decodedData, 'event-skey');
        const originalData = bytes.toString(CryptoJS.enc.Utf8);
        return originalData;
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    };
    const deceventName = decryptData(encryptedEventName);
    const deceventCode = decryptData(encryptedEventCode);
    console.log(deceventName);
    console.log(deceventCode);
    //SERVICE CALL
    const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
    const evUrl = `/api/server3/UHES-0.0.1/WS/getAllFepEventMasterById?id=${deceventCode}`;
    const fetchAccessToken = async () => {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const tokenData = await tokenResponse.json();
      return tokenData.access_token;
    }

    const fetchEventDet = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const dataResponse = await fetch(evUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!dataResponse.ok) throw new Error('Failed to fetch data');
        const responseData = await dataResponse.json();
        const evDet = responseData.data;
        console.log('event det:', responseData.data);
        setEventCode(evDet.evenCode);
        setEventName(evDet.evenName);
        setEventDesc(evDet.evenDescription);
      } catch (err) {
        console.error(err.message);
      }
    }
    useEffect(() => {
      fetchEventDet();
    }, []);
    return (
      <Fragment>
        <Container fluid>
          <Form className="text-center">
            <h3 className="form-title">Update Event Master</h3>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Event Short Code</Form.Label>
                <Form.Control type="text" value={eventCode} onChange={(e)=>setEventCode(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Event Name</Form.Label>
                <Form.Control type="text" value={eventName} onChange={(e)=>setEventName(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Event Description</Form.Label>
                <Form.Control type="text" value={eventDesc} onChange={(e)=>setEventDesc(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col xs={6} className='d-flex justify-content-between'>
            <Form.Label>Event Type</Form.Label>
            <Form.Check inline label="Event" name="eventTypes" type="radio" id="radio1" value="Event" checked={eventType==="Event"} onChange={(e)=>setEventType(e.target.value)} />
            <Form.Check inline label="Tamper" name="eventTypes" type="radio" id="radio2" value="Tamper" checked={eventType==="Tamper"} onChange={(e)=>setEventType(e.target.value)} />
            </Col>
            <Col xs={10} lg={6} className='d-flex justify-content-start m-2'>
              {eventCode && (
                <Button variant="primary" size="md">Update</Button>
              )}
              <Button variant="primary" size="md" onClick={handleClick}>Cancel</Button>
            </Col>
          </Form>
        </Container>
      </Fragment>
    );
  }
  return (
    <Fragment>
      <Row>
        <div style={{ direction: 'rtl' }} >
          <FontAwesomeIcon icon={faRotateRight} onClick={reloadComponent} style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginLefta: '15px' }} />
        </div>
      </Row>
      <ReLoadCmp key={key} />
    </Fragment>
  );
}

export default EventUpdate;