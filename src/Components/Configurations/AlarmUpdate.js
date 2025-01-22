import { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Col, Button, Container, Row } from 'react-bootstrap';
import CryptoJS from 'crypto-js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

const AlarmUpdate = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1);
  };
  const ReLoadCmp = () => {
    const [alarmCode, setAlarmCode] = useState();
    const [alarmName, setAlarmName] = useState();
    const [alarmDesc, setAlarmDesc] = useState();
    const [alarmType, setAlarmType] = useState();
    const [alarmTypeOptions, setAlarmTypeOptions] = useState([]);
    const navigate=useNavigate();
    //Navigation Handling
    const handleClick=()=>{
      navigate('/alarmmaster');
    }
    //Decryption of Params
    const { encryptedAlarmName, encryptedAlarmCode } = useParams();
    const decryptData = (encryptedData) => {
      if (!encryptedData) {
        console.error('No encrypted data provided.');
        return null;
      }

      try {
        const decodedData = decodeURIComponent(encryptedData);
        const bytes = CryptoJS.AES.decrypt(decodedData, 'alarm-skey');
        const originalData = bytes.toString(CryptoJS.enc.Utf8);
        return originalData;
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    };
    const decalarmName = decryptData(encryptedAlarmName);
    const decalarmCode = decryptData(encryptedAlarmCode);
    console.log(decalarmName);
    console.log(decalarmCode);
    //SERVICE CALL
    const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
    const almUrl = `/api/server3/UHES-0.0.1/WS/getAllFepAlaramsbyId?id=${decalarmCode}`;
    const almTypeUrl = '/api/server3/UHES-0.0.1/WS/getAllfepAlaramType';
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

    const fetchAlarmDet = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const dataResponse = await fetch(almUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!dataResponse.ok) throw new Error('Failed to fetch data');
        const responseData = await dataResponse.json();
        const alarmDet = responseData.data;
        console.log('alarm det:', responseData.data);
        setAlarmCode(alarmDet.alaramCode);
        setAlarmName(alarmDet.alaramName);
        setAlarmDesc(alarmDet.alaramDescription);
      } catch (err) {
        console.error(err.message);
      }
    }
    const fetchAlarmTypeDet = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const dataResponse = await fetch(almTypeUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!dataResponse.ok) throw new Error('Failed to fetch data');
        const responseData = await dataResponse.json();
        const alarmTypes = responseData.data;
        console.log('alarm det:', alarmTypes);
        console.log('types:', typeof (alarmTypes));
        setAlarmTypeOptions(alarmTypes);
      } catch (err) {
        console.error(err.message);
        setAlarmTypeOptions([]);
      }
    }

    useEffect(() => {
      fetchAlarmDet();
      fetchAlarmTypeDet();
    }, []);
    return (
      <Fragment>
        <Container fluid>
          <Form className="text-center">
            <h3 className="form-title">Update Alarm Master</h3>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Alarm Type</Form.Label>
                <Form.Control as='select' value={alarmType} onChange={(e) => setAlarmType(e.target.value)}>
                  <option value="">-NA-</option>
                  {alarmTypeOptions?.map((almType, index) => (
                    <option key={index} value={almType.alarmCode}>{almType.alarmType}</option>
                  ))}
                </Form.Control>

              </Form.Group>
            </Col>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Alarm Code</Form.Label>
                <Form.Control type="text" value={alarmCode} readOnly required />
              </Form.Group>
            </Col>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Alarm Name</Form.Label>
                <Form.Control type="text" value={alarmName} readOnly required />
              </Form.Group>
            </Col>
            <Col xs={10}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Alarm Description</Form.Label>
                <Form.Control type="text" value={alarmDesc} readOnly required />
              </Form.Group>
            </Col>
            <Col xs={10} lg={6} className='d-flex justify-content-start m-2'>
              <Button variant="primary" size="md">Update</Button>
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

export default AlarmUpdate;