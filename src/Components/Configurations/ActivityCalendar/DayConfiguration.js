import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import {AgGridReact} from 'ag-grid-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import loadingGif from '../../../Assets/img2.gif';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Search } from "react-bootstrap-icons";


function DayConfiguration({ onCancel,tabKey,parentTab,CalendarName, metertypeId,manufactureId}) {
  console.log(metertypeId)
  console.log(manufactureId)
  const [time, setTime] = useState("");
  const [Daydata,setDaydata]=useState([]);
  const [searchKey,setSearchKey]=useState();
  const [dayjson,setDayjson]=useState([]);
  const[loading,setLoading]=useState(false);
  const [OriginalDaydata,setOriginalDaydata] = useState([])
  const handleCancelClick = () => {
    onCancel(tabKey,parentTab); 
  };

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

  const DayUrl=`/api/server3/UHES-0.0.1/WS/getJsonDataByCalendarName?calendername=${CalendarName}`
  const fetchAllDays = async () => {
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(DayUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile headers");
      }
      const responseData = await response.json();
      setDaydata(responseData.data)
      setOriginalDaydata(responseData.data)
      console.log(responseData.data);
     } catch (error) {
      console.error("Error fetching activity calendars:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchAllDays()
  },[])

  
  const Dayjson="/api/server3/UHES-0.0.1/WS/gettoudayzonetempBymeterManafactureandmetertypeandcalendarname?calendarname=BGT_AC&metermanu=466cd15e-45c7-49d6-8ffe-4b02c2059a&metertype=47be95a3-d192-4158-af9c-e4a5c326fa3d"
  const fetchDaysjson = async () => {
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(Dayjson, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile headers");
      }
      const responseData = await response.json();
      setDayjson(responseData.data)
      console.log(responseData.data);
     } catch (error) {
      console.error("Error fetching activity calendars:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchDaysjson();
  }, []);

  const ColDefs=[
    {headerName:"Day",field:"Day",flex:2,width:100},
    {headerName:"time",field:"time",flex:2,width:100},
    {headerName:"Tou",field:"Tou",flex:2,width:100},
    {headerName:"Delete",   field: "actions", 
      cellRenderer: (params) => {
        return (
          <button
        style={{ background: '#FF2C06', border: '#FF2C06', cursor: "pointer" }} 
        className="btn btn-info btn-file waves-effect mdb-btn-raised btn-primary mdb-ripple-effect"
        title="Delete Row"
        
        >
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
        );
      },
      width: 100},
  ]

  const exportExcel = async () => {
    await fetchAllDays();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activity Calendars Day data');
    const headers = ['Day','time','Tou'];
    const lastColumn = String.fromCharCode(64 + headers.length);
    worksheet.mergeCells('A1:C1');
    const inputfieldcell = worksheet.getCell('A1');
    inputfieldcell.font = { italic: true, color: { argb: 'FF0000FF' }, size: 12 }; 
    inputfieldcell.alignment = { vertical: 'middle', horizontal: 'left' };
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } }; 
    });
    Daydata.forEach((data) => {
      worksheet.addRow([
        data.Day,
        data.time,
        data.Tou
      ]);
    });
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength + 6;
    });
    worksheet.autoFilter = { from: 'A2', to: `${lastColumn}2` };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Daydata.xlsx');
  };

  

  const exportCSV = async () => {
    await fetchAllDays();
    const worksheet = XLSX.utils.json_to_sheet(Daydata);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Daydata.csv");
  };

  const exportPDF = async () => {
    await fetchAllDays();
    const doc = new jsPDF();
    doc.text("Activity Calendars Day Data", 20, 10);
    doc.autoTable({
      head: [
        ['Day','time','Tou']
      ],
      body: Daydata.map((data) => [
        data.Day,
        data.time,
        data.Tou
      ]),
    });
    doc.save("Daydata.pdf");
  };

  
  const copyData = () => {
    let textData = "Days\tTime\t\Tou\n";
        textData += Daydata
            .map(row => `${row.Day}\t${row.time}\t${row.Tou}`) 
            .join("\n"); 
        navigator.clipboard.writeText(textData)
            .then(() => alert("Data copied to clipboard!"))
            .catch((error) => alert("Failed to copy data: " + error));
};

  

  const searchData = () => {
    if (!searchKey.trim()) {
      setDaydata(OriginalDaydata); 
    } else {
      const filteredData = OriginalDaydata.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchKey.toLowerCase())
        )
      );
      setDaydata(filteredData);
    }
  };

  return (
    <div>
      <Form>
        <Row className="d-flex justify-content-center">
          <Col md={4}>
            <Form.Group className="mb-3" controlId="days">
              <Form.Label style={{ fontSize: "15px" }}>
                Days <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select>
                <option value="">-NA-</option>
                {[...Array(32).keys()].slice(1).map((day) => (
                  <option key={day} value={day}>{`Day ${day}`}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="d-flex justify-content-start">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="timeZone">
              <Form.Label style={{ fontSize: "15px" }}>
                Time Zone <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select>
                <option value="">-NA-</option>
                {[...Array(9).keys()].slice(1).map((tz) => (
                  <option key={tz} value={tz}>{`Tou ${tz}`}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <span className="text-danger">*</span> Time
              </Form.Label>
              <Form.Control
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <Button
              className="btn btn-md mr-1"
              style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form>

      <div className="container-fluid col-12">
        <div className="d-flex flex-wrap mt-4">
          <div className="d-flex flex-wrap" style={{ marginLeft: "1vw", gap: "1vw" }}>
            <Button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportExcel}>
              Excel
            </Button>
            <Button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportPDF}>
              PDF
            </Button>
            <Button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportCSV}>
              CSV
            </Button>
            <Button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={copyData}>
              Copy
            </Button>
          </div>

          <div className="ms-auto">
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
          </div>
        </div>

        <div className="container-fluid ag-theme-quartz mt-3 mx-auto" style={{ height: 350, width: "100%" }}>
          <AgGridReact
            rowData={Daydata}
            columnDefs={ColDefs}
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
            overlayNoRowsTemplate={
              '<span class="ag-overlay-no-rows-center">No rows to display</span>'
            }
            onGridReady={(params) => {
              if (loading) {
                params.api.showLoadingOverlay();
              } else {
                params.api.hideOverlay();
              }
            }}
          />
        </div>

        <div className="d-flex justify-content-center gap-5 mt-5">
          <Button
            className="btn btn-md mr-1"
            style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}
          >
            Save
          </Button>
          <Button
            className="btn btn-md mr-1"
            style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}
            onClick={handleCancelClick}
          >
            Back
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default DayConfiguration;