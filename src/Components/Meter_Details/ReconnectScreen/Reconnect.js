import { Form, Row, Col, Button ,InputGroup,Modal} from "react-bootstrap";
import { useState, useEffect, useCallback, useRef } from 'react';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { FaCheckCircle } from "react-icons/fa";

function Reconnect() {
  const [meternumber, setMeternumber] = useState("");
  const [office] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");
  const [meterdata, setMeterdata] = useState("");
  const [originalMeterDetails, setOriginalMeterDetails] = useState([]);
  const [allmeterdetails, setAllmeterdetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [showtable, setShowtable] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const[show,setShow]=useState(false);
  const [dto, setDto] = useState({});
  const [metertoken, setMeterToken] = useState([]); 
  const [transactionId, setTransactionId] = useState("");
 
  
  
  const handleShow = () => setShow(true);


  const ColumnDefs = [
    { headerName: "Meter Number", field: "meterNumber" },
    { headerName: "Transaction Id", field: "transactionId" },
    { headerName: "Comments", field: "comments" },
    { headerName: "Reason", field: "reason" },
    { headerName: "Request From", field: "responseFrom" },
    { 
      headerName: "Request Time", 
      field: "requestTime",
      valueFormatter: (params) => formatDateTime(params.value),
    },
    { 
      headerName: "Response Time", 
      field: "responseTime",
      valueFormatter: (params) => formatDateTime(params.value),
    },
    { headerName: "Transaction Status", field: "responseCode" },
  ];

  

  const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
  const fetchAccessToken = useCallback(async () => {
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
    if (!response.ok) throw new Error("Failed to authenticate");
    const data = await response.json();
    return data.access_token;
  }, []);

  const fetchMeterDetails = async () => {
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(
        `/api/server3/UHES-0.0.1/WS/getmeterdetails?mtrNumber=${meternumber}&office=${office}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      if (!response.ok) throw new Error("Failed to fetch meter details");
  
      const responsedata = await response.json();
      console.log("Response Data:", responsedata.data);
      if (!Array.isArray(responsedata.data) || responsedata.data.length === 0) {
        throw new Error("No data found in response");
      }
      const firstItem = responsedata.data[0];
      const dto = {
        connectiontype: firstItem.relaystatus,
        meterno: firstItem.meterno,
        "reason": "string",
        type: firstItem.metertype,
        "userId": "string"
      }
      console.log("DTO:", dto);
      setDto(dto);
      setMeterdata(responsedata.data);
  
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };
 

  const fetchAllMeterDetails = async () => {
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(
        `/api/server3/UHES-0.0.1/WS/getMeterConnectDisconnectData?meterno=${meternumber}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch all meter details");
      const allmeterdata = await response.json();
      setAllmeterdetails(allmeterdata.data);
      setOriginalMeterDetails(allmeterdata.data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

 
  const meterconnection = async (dto) => {
    console.log(dto)
    setLoading(true); 
    try {
      const accessToken = await fetchAccessToken();
      console.log("Request Body:", JSON.stringify(dto)); 
      const response = await fetch(
        `/api/server3/UHES-0.0.1/WS/FepgetMeterConnectionDisconnection`,
        {
          method: "POST", 
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dto), 
        }
      );
      console.log("Raw Response:", response); 
      if (!response.ok) throw new Error("Failed to process meter connection/disconnection");
      const data = await response.json();
      console.log(data); 
      setMeterToken(data); 
      localStorage.setItem("meterToken", JSON.stringify(data));
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const savedMeterToken = localStorage.getItem("meterToken");
    if (savedMeterToken) {
      setMeterToken(JSON.parse(savedMeterToken));
      console.log("Restored metertoken from localStorage:", savedMeterToken);
    }
  }, []);

  useEffect(() => {
    if (metertoken && metertoken.data) {
      console.log("Updated metertoken:", metertoken);
      setTransactionId(metertoken.data[0].transactionId);
    }
  }, [metertoken]);
 
  if (metertoken && metertoken.data) {
    console.log(metertoken.data[0].transactionId);
  } else {
    console.log("Metertoken is null or data is unavailable");
  }
   
  useEffect(() => {
    if (showtable || showGrid) {
      fetchMeterDetails();
    }
  }, [showtable, showGrid, meternumber]);

 

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowtable(true);
    setShowGrid(true);
    fetchMeterDetails();
    fetchAllMeterDetails();
  };

  const handleConnect = (e) =>{
    e.preventDefault();
    setShowModal(true);
    meterconnection(dto);  
  }

  const exportExcel = async () => {
    await fetchAllMeterDetails();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reconnect Screen');
    const selectedmeternumber = `Group Name: ${meternumber || 'N/A'}`;
    const headers = ['meterNumber', 'transactionId', 'comments', 'reason', 'responseFrom', 'requestTime', 'responseTime', 'responseCode'];
    const lastColumn = String.fromCharCode(64 + headers.length);
    console.log("Selected Groupname:", meternumber);
    worksheet.mergeCells('A1:C1');
    const inputfieldcell = worksheet.getCell('A1');
    inputfieldcell.value = selectedmeternumber;
    inputfieldcell.font = { italic: true, color: { argb: 'FF0000FF' }, size: 12 }; // Blue italic text
    inputfieldcell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.mergeCells(`D1:${lastColumn}1`);
    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } }; // Light blue background
    });
    // Add data rows
    allmeterdetails.forEach((data) => {
      worksheet.addRow([
        data.meterNumber,
        data.transactionId,
        data.comments,
        data.reason,
        data.responseFrom,
        data.requestTime,
        data.responseTime,
        data.responseCode
      ]);
    });
    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength + 6;
    });
    // Add auto-filter
    worksheet.autoFilter = { from: 'A2', to: `${lastColumn}2` };
    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Reconnect.xlsx');
  };



  const exportCSV = async () => {
    await fetchAllMeterDetails();
    const worksheet = XLSX.utils.json_to_sheet(allmeterdetails);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Reconnect.csv");
  };

  const exportPDF = async () => {
    await fetchAllMeterDetails();
    const doc = new jsPDF();
    doc.text("Meter Details Data", 20, 10);
    doc.autoTable({
      head: [
        [
          "meterNumber",
          "transactionId",
          "comments",
          "reason",
          "responseFrom",
          "requestTime",
          "responseTime",
          "responseCode",
        ],
      ],
      body: allmeterdetails.map((data) => [
        data.meterNumber,
        data.transactionId,
        data.comments,
        data.reason,
        data.responseFrom,
        data.requestTime,
        data.responseTime,
        data.responseCode,
      ]),
    });
    doc.save("Reconnect.pdf");
  };



  console.log(allmeterdetails);
  const searchData = (e) => {
    const searchValue = e.target.value;
    setSearchKey(searchValue);
    console.log(searchValue)
    if (searchValue === "") {
        setAllmeterdetails(originalMeterDetails);//here we took an extra variable to store the data
    } else {
      const filteredData = originalMeterDetails.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setAllmeterdetails(filteredData);
      console.log(filteredData)
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setShowModal(false);
  };


  // Function to format the date and time
const formatDateTime = (timestamp) => {
  if (!timestamp) return ''; // Handle null or undefined values
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

useEffect(()=>{
  fetchAllMeterDetails()
},[transactionId])
  return (
    <div>
      <h1 className="form-title">Reconnect Screen</h1>
      <Form>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Meter Number</Form.Label>
            <Form.Control
              type="text"
              value={meternumber}
              onChange={(e) => setMeternumber(e.target.value)}
            />
          </Col>
        </Row>
        {meternumber && (
            <div className="text-center mt-3">
          <Button
            type="submit"
            className="submitbutt"
            variant="primary"
            onClick={handleSubmit}
          >
            Search
          </Button>
        </div>
        )}
      </Form>
      {meterdata && showtable && (
        <div className="mt-4">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-primary text-dark">
                <th>Consumer Number</th>
                <th>Meter Number</th>
                <th>Relay Status</th>
              </tr>
            </thead>
            <tbody>
              {meterdata.map((data, index) => (
                <tr key={index}>
                  <td>{data.account_number}</td>
                  <td>{data.meterno}</td>
                  <td>{data.relaystatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <center>
            <div className="text-center mt-3">
              <Button type="submit" className="submitbutt" variant="primary" onClick={handleConnect}>
                Connect
              </Button>
            </div>
          </center>
        </div>
      )}
      {allmeterdetails && showGrid && (
        <div>
        <Row className="mt-4">
        <Col xs={12} md={6} className="d-flex flex-wrap mb-3">
          <Button variant="primary" size="md" className="m-1" onClick={exportExcel}>
            Excel
          </Button>
          <Button variant="primary" size="md" className="m-1" onClick={exportPDF}>
            PDF
          </Button>
          <Button variant="primary" size="md" className="m-1" onClick={exportCSV}>
            CSV
          </Button>
        </Col>
        <Col xs={12} md={4} className="ms-auto">
          <input type="text" className="form-control" placeholder="search" value={searchKey} onChange={searchData} />
        </Col>
      </Row>
          <div
            className="meter-data-table ag-theme-quartz"
            id="myGrid"
            style={{ height: "400px", width: "100%" }}
          >
            <AgGridReact
              rowData={allmeterdetails}
              columnDefs={ColumnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 30, 40]}
            />
          </div>
        </div>
      )}
      <Modal show={showModal} onHide={() =>setShowModal(false)}>
      <Modal.Header style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Modal.Title style={{ textAlign: "center" }}>
        <FaCheckCircle style={{ color: "green", fontSize: "3rem" }} />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
    <p style={{ fontWeight: 'bold', fontSize: '20px', color: 'black' }}>
      Request Sent Successfully With : {transactionId}
    </p>
  </Modal.Body>
      <Modal.Footer style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Button variant="primary"style={{ textAlign: "center" }} onClick={handleClose}>
        OK
      </Button>
    </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Reconnect;