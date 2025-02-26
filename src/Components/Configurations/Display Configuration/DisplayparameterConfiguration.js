import React, { useState, useCallback, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import './DisplayparameterUpdate.css';

const DisplayparameterConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(null);
  const [meterTypes, setMeterTypes] = useState([]);
  const [meterMakeData, setMeterMakeData] = useState([]);
  const [selectedMeterType, setSelectedMeterType] = useState("");
  const [selectedMeterMake, setSelectedMeterMake] = useState("");
  const [displayConfigName, setDisplayConfigName] = useState("");
  const [hexData, setHexData] = useState("");
  const [mode, setMode] = useState("");

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
      setMeterTypes(dataJson.data.map((item) => item.type));

      // Fetch Meter Make Details
      const meterMakeUrl = "/api/server3/UHES-0.0.1/WS/getmetermake";
      const meterMakeResponse = await fetch(meterMakeUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const meterMakeJson = await meterMakeResponse.json();
      setMeterMakeData(meterMakeJson.data.map((item) => item.make));

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setLoading(false);
      setDataAvailable("No Data Available");
    }
  }, []);

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
                style={{ width: "200px" }}
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
                style={{ width: "200px", marginBottom: "10px" }}
                value={displayConfigName}
                onChange={(e) => setDisplayConfigName(e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col>
            <label>Mode:</label>
              <select
                style={{ width: "200px" }}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                  <option> </option>
                  <option>mode 1</option>
                  <option>mode 2</option>
              </select>
            </Col>
          </Row>
          <div className="button-container">
            <button className="styled-button">View</button>
            <button className="styled-button">Back</button>
          </div>
        </>
      )}
      {dataAvailable && <p>{dataAvailable}</p>}
    </div>
  );
};

export default DisplayparameterConfiguration;
