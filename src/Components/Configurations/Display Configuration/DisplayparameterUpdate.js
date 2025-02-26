import React, { useState, useCallback, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import './DisplayparameterUpdate.css';
const DisplayparameterUpdate = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(null);
  const [meterTypes, setMeterTypes] = useState([]);
  const [meterMakeData, setMeterMakeData] = useState([]);
  const [selectedMeterType, setSelectedMeterType] = useState("");
  const [selectedMeterMake, setSelectedMeterMake] = useState("");
  const [displayConfigName, setDisplayConfigName] = useState("");
  const [hexData, setHexData] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: "Admin",
          password: "Admin@123",
          client_id: "fooClientId",
          client_secret: "secret",
        }),
      });

      if (!tokenResponse.ok) {
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch Meter Types
      const dataUrl = "/api/server2/AMI-0.0.1/MC/getAllMeterTypeDetails";
      const dataResponse = await fetch(dataUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const dataJson = await dataResponse.json();
      const meterTypesList = dataJson.data.map((item) => item.type);
      setMeterTypes(meterTypesList);

      // Fetch Meter Make Details
      const meterMakeUrl = "/api/server3/UHES-0.0.1/WS/getmetermake";
      const meterMakeResponse = await fetch(meterMakeUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const meterMakeJson = await meterMakeResponse.json();
      const meterMakeList = meterMakeJson.data.map((item) => item.make);
      setMeterMakeData(meterMakeList);

      // Compare with Prop Data and Set Selected Values
      if (data && data.meterType && meterTypesList.includes(data.meterType)) {
        setSelectedMeterType(data.meterType);
      }

      if (data && data.meterManufacture && meterMakeList.includes(data.meterManufacture)) {
        setSelectedMeterMake(data.meterManufacture);
      }
      if (data.displayConfigName) {
        setDisplayConfigName(data.displayConfigName);
      }
      if (data.hexData) {
        setHexData(data.hexData);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setLoading(false);
      setDataAvailable("No Data Available");
    }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
        <Row>
        <Col>
          <label>Meter Types:</label>
          <select
            style={{ width: "200px" }}
            value={selectedMeterType}
            onChange={(e) => setSelectedMeterType(e.target.value)}
          >
            {meterTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          </Col>
          <Col>
          <label>Meter Make:</label>
          <select
            style={{ width: "200px" ,height: "30px !important"}}
            value={selectedMeterMake}
            onChange={(e) => setSelectedMeterMake(e.target.value)}
          >
            {meterMakeData.map((make, index) => (
              <option key={index} value={make}>
                {make}
              </option>
            ))}
          </select>
          </Col>
          <Col>
          <label>Display Config Name:</label>
          <input
            type="text"
            style={{ width: "200px", marginBottom: "10px" ,height: "30px !important"}}
            value={displayConfigName}
            onChange={(e) => setDisplayConfigName(e.target.value)}
          />
          </Col>
          </Row>
          <Row>
          <Col>
          <label>Hex Data:</label>
          <input
            type="text"
            style={{ width: "200px", marginBottom: "10px" ,height: "30px !important"}}
            value={hexData}
            onChange={(e) => setHexData(e.target.value)}
          />
          </Col>
          </Row>
          <div className="button-container">
            <button className="styled-button">Update</button>
            <button className="styled-button">Back</button>
          </div>

        </>
      )}
      {dataAvailable && <p>{dataAvailable}</p>}
    </div>
  );
};

export default DisplayparameterUpdate;
