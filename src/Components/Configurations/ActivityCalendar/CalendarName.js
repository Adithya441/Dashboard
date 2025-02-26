import {Container,Row,Col,Button,Form,InputGroup} from "react-bootstrap";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {Fragment} from "react";
import {useState,useEffect} from "react"
import {AgGridReact} from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {useDropzone} from 'react-dropzone';
import { Search } from "react-bootstrap-icons";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import loadingGif from '../../../Assets/img2.gif';
import ConfigurationTabs from './ActivityTabs.js';



function CalendarName({data,onCancel}){
    
   
    const[manufacturedata,setmanufacturedata]=useState([]);
    const[metertypedata,setmetertypedata]=useState([]);
    const[selectedmanufacture,setselectedmanufacture]=useState('');
    const[loading,setLoading]=useState(false);
    const[selectedmetertype,setselectedmetertype]=useState('');
    const[daydata,setdaydata]=useState([]);
    const[activationdata,setActivationdata]=useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [originalActivationData,setOriginalActivationData]= useState([]);
    const [searchKey,setSearchKey]=useState();
    const [showContent, setShowContent] = useState(false);
    const [selectedManufactureId, setSelectedManufactureId] = useState("");
    const [selectedMeterTypeId, setSelectedMeterTypeId] = useState("");

  
    const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            username: "Admin",
            password: "Admin@123",
            client_id: "fooClientId",
            client_secret: "secret",
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }
        const data = await response.json();
        return data.access_token;
      } catch (error) {
        console.error("Error fetching access token:", error.message);
        throw error;
      }
    };

   
    const manufactureUrl="/api/server3/UHES-0.0.1/WS/getmetermake";
    const fetchAllmanufactures = async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(manufactureUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch profile headers");
  
          }
          const responseData = await response.json();
          setmanufacturedata(responseData.data);
          setSelectedManufactureId(responseData.data[0].id);
          console.log("Fetched Data:", responseData.data);
        } catch (error) {
          console.error("Error fetching activity calendars:", error.message);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchAllmanufactures();
      }, []);
    
    
      const metertypeUrl="/api/server3/UHES-0.0.1/WS/getMeterType";
      const fetchAllmetertypes = async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(metertypeUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch profile headers");
          }
          const responseData = await response.json();
          setmetertypedata(responseData.data);
          setSelectedMeterTypeId(responseData.data[0].id);
          console.log("Fetched Data:", responseData.data);
        } catch (error) {
          console.error("Error fetching activity calendars:", error.message);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchAllmetertypes();
      }, []);
    
      //Dropdown 4 services
  
     const CalendarName=data.id.CALENDER;
     console.log(CalendarName);
      const handleViewClick = () => {
        setShowContent(true);
      };
    
    console.log(data)
    
    const handleCancelClick = () => {
      onCancel();
    };
    return (
      <div>
        <Form>
          <Row className="mt-4 justify-content-center">
            <Col md={4}>
              <Form.Group className="mb-3" controlId="meterManufacture">
                <Form.Label style={{ fontSize: "15px" }}>
                  Meter Manufacture <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Select
                  id="meterManufacture"
                  name="meterManufacture"
                  value={selectedmanufacture || data.id.MANUFACTURER}
                  onChange={(e) => setselectedmanufacture(e.target.value)}
                >
                  <option value="">-NA-</option>
                  {manufacturedata.map((manufacture, index) => (
                    <option key={index} value={manufacture.make}>
                      {manufacture.make}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="metertype">
                <Form.Label style={{ fontSize: "15px" }}>
                  Meter type <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Select
                  id="metertype"
                  name="metertype"
                  value={selectedmetertype || data.id.TYPE}
                  onChange={(e) => setselectedmetertype(e.target.value)}
                >
                  <option value="">-NA-</option>
                  {metertypedata.map((metertype, index) => (
                    <option key={index} value={metertype.type}>
                      {metertype.type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Label>Calendar Name</Form.Label>
              <Form.Control type="text" value={CalendarName} />
            </Col>
          </Row>
           </Form>
        <div className="d-flex justify-content-center gap-5 mt-5">
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={handleViewClick}>
            View
          </button>
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={handleCancelClick}>
            Back
          </button>
          </div>
          {showContent && (
            <div className="mt-4">
        <ConfigurationTabs
          showContent={showContent}
          onViewClick={handleViewClick}
          CalendarName={CalendarName}
          manufactureId={selectedManufactureId} 
          metertypeId={selectedMeterTypeId} 
        />
        </div>
      
      )}
      </div>
    );
  }
  export default CalendarName    