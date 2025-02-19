import {Form,Row,Col,Button, Container,InputGroup} from 'react-bootstrap';
import { useState, useEffect,Fragment } from "react";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {TreeSelect} from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import loadingGif from '../../Assets/img2.gif';
import { Search } from "react-bootstrap-icons";
import './styless.css';

function ConnectDisconnectReport(){
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const[conndisconndata,setconndisconndata]=useState([]);
    const[loading,setLoading]=useState(false);
    const[submitted,setsubmitted]=useState(false);
    const[searchKey,setSearchKey]=useState();
    const[originalData,setOriginalData]=useState([]);

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
   
    const fromDate1 = fromDate.replace(/-/g, ""); 
    const toDate1= toDate.replace(/-/g, "");
    const GridUrl = `/api/server3/UHES-0.0.1/WS/ServerpaginationForConnDisconnReportAllTransactions?draw=2&fromDate=${fromDate1}&length=100&start=0&toDate=${toDate1}`;
    const fetchAllConnectDisconnect = async () => {
       setLoading(true);
       try {
         const accessToken = await fetchAccessToken();
         const response = await fetch(GridUrl, {
           headers: { Authorization: `Bearer ${accessToken}` },
         });
   
         if (!response.ok) {
           throw new Error("Failed to fetch device Masters");
         }
         const responseData = await response.json();
         setconndisconndata(responseData.data || []);
         setOriginalData(responseData.data || []);
         console.log("Fetched Data:", responseData.data);
       } catch (error) {
         console.error("Error fetching device Masters:", error.message);
       } finally {
         setLoading(false);
       }
     };
 
     
    
     const handleSubmit = (event) =>{
         event.preventDefault();
         fetchAllConnectDisconnect();
         setsubmitted(true);
     }

     const searchData = () => {
        if (!searchKey.trim()) {
            setconndisconndata(originalData); 
        } else {
          const filteredData = originalData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          setconndisconndata(filteredData);
        }
      };

      const ColumnDefs =[
          {headerName: "Meter Number", field: "METER_NUMBER",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "TransactionId", field: "TRANSACTION_ID",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Request From", field: "REQUEST_FROM",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Request Time", field: "REQUEST_TIME",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Response Time", field: "RESPONSE_TIME",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Reason", field: "REASON",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Request Command", field: "REQUEST_COMMAND",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Response", field: "RESPONSE_CODE",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "User Name", field: "USER_NAME",flex: 2, minWidth: 200, maxWidth: 350,filter: true},
          {headerName: "Reading Type", field: "REQUEST_TYPE",flex: 2, minWidth: 200, maxWidth: 350,filter: true}
      ]
    return(
        <Fragment>
            <Container fluid>
                <Form>
                    <Row className="m-1">
                        <Col xs={12} md={4} style={{marginLeft:"-16px"}}>
                            <Form.Group>
                                <Form.Label>
                                    <span style={{ color: "red" }}>*</span> From Date
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>
                                    <span style={{ color: "red" }}>*</span> To Date
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                <div className="text-center mt-3">
          <Button
            type="submit"
            className="submitbutt"
            variant="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
          </div>
          {submitted && (
          <Row className="mt-2">
            <Col xs={12} md={6} className="d-flex flex-wrap mb-2 ms-0 me-auto">
              <Button variant="primary" size="md" className="m-1">
                Excel
              </Button>
              <Button variant="primary" size="md" className="m-1">
                PDF
              </Button>
              <Button variant="primary" size="md" className="m-1">
                CSV
              </Button>
            </Col>
            <Col xs={12} md={4} className="ms-auto" style={{marginLeft:"-7px"}}>
               <InputGroup>
               <Form.Control
               type="text"
               placeholder="Search..."
               value={searchKey}
               onChange={(e) => setSearchKey(e.target.value)} 
               />
              <InputGroup.Text onClick={searchData} style={{ cursor: "pointer" }}>
              <Search color="blue" size={15} />
             </InputGroup.Text>
             </InputGroup>
              </Col>
          </Row>
        )}
        <div className="align-items-center  m-1 ms-0 me-auto">
          {submitted && fromDate && toDate &&(
            <div className="container-fluid ag-theme-quartz mx-auto" style={{ height: 500, width: "92vw" }}>
            <AgGridReact
            rowData={conndisconndata || []} // Ensure it's always an array
            columnDefs={ColumnDefs}
            pagination={true}
            rowSelection="multiple"
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 30, 40]}
            onSelectionChanged={(event) => {
              const selectedRows = event.api.getSelectedRows();
              console.log("Selected Rows:", selectedRows);
            }}
            overlayLoadingTemplate={`
              <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                background-color: rgba(255, 255, 255, 0.8);
              ">
                <img 
                  src="${loadingGif}" 
                  alt="Loading..." 
                  style="width: 50px; height: 50px;" 
                />
              </div>
            `}
            overlayNoRowsTemplate={`<span class="ag-overlay-no-rows-center">No rows to display</span>`}
            onGridReady={(params) => {
              if (loading) {
                params.api.showLoadingOverlay();
              } else if (!conndisconndata || conndisconndata.length === 0) {
                params.api.showNoRowsOverlay(); 
              } else {
                params.api.hideOverlay();
              }
            }}
          />          
            </div>
          )}
      </div>
            </Container>
        </Fragment>
        
    )
}
export default ConnectDisconnectReport