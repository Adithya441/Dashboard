import {useState,useEffect} from "react"
import {AgGridReact} from "ag-grid-react";
import {Row,Col,Button,Form,InputGroup} from "react-bootstrap";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { BsFillTrashFill } from 'react-icons/bs';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import loadingGif from '../../../Assets/img2.gif';
import { Search } from "react-bootstrap-icons";
import './styles.css';
import ConfigurationTabs from './ActivityTabs.js';


function NewActivityCalendar({onCancel}){

    const[manufacturedata,setmanufacturedata]=useState([]);
    const[metertypedata,setmetertypedata]=useState([]);
    const[selectedmanufacture,setselectedmanufacture]=useState('');
    const[selectedmetertype,setselectedmetertype]=useState('');
    const [calendarName, setCalendarName] = useState("");
    const[loading,setLoading] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [searchKey,setSearchKey]=useState();


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
 
     
     //Dropdown for all 4 Services
     const handleCancelClick = () => {
      onCancel();
    };

    const handleViewClick = () => {
      setShowContent(true);
    }; 

    return(
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
                  value={selectedmanufacture}
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
                  value={selectedmetertype}
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
              <Form.Control  type="text" value={calendarName} onChange={(e) => setCalendarName(e.target.value)} />
            </Col>
          </Row>
          </Form>
          <div className="d-flex justify-content-center gap-5 mt-5">
          < button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={handleViewClick} >
            Configure
          </button>
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}  onClick={handleCancelClick}>
            Back
          </button>
          </div>
          <ConfigurationTabs
          showContent={showContent}
          onViewClick={handleViewClick}
          CalendarName={calendarName}/>
        </div>
    )
}
export default NewActivityCalendar