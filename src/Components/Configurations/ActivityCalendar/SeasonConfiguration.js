import { useState ,useEffect} from "react";
import { Form, Row, Col,Button ,InputGroup} from "react-bootstrap";
import {AgGridReact} from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import loadingGif from '../../../Assets/img2.gif';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Search } from "react-bootstrap-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';


function SeasonConfiguration({ onCancel,tabKey,parentTab ,CalendarName}) {
  const [date, setDate] = useState("");
  const [searchKey,setSearchKey]=useState();
  const [loading,setLoading]=useState(false)
  const [seasondata,setseasondata] = useState([]);
  const [OriginalSeasondata,setOriginalSeasondata] = useState([]);
  const[weekdrop,setweekdrop]=useState([]);
  const handleCancelClick = () => {
    onCancel(tabKey,parentTab ); 
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

  const weekdropdown=`/api/server3/UHES-0.0.1/WS/getWeekJsonDataByCalenderName?calendername=${CalendarName}`
  const fetchWeek = async()=>{
    setLoading(true);
    try {
      const accessToken = await fetchAccessToken();
      const response = await fetch(weekdropdown, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile headers");
      }
      const responseData = await response.json();
      setweekdrop(responseData.data);
    } catch (error) {
      console.error("Error fetching activity calendars:", error.message);
    } finally {
      setLoading(false);
    }
}

useEffect(()=>{
  fetchWeek();
},[])

const SeasonUrl=`/api/server3/UHES-0.0.1/WS/getSeasonJsonDataByCalenderName?calendername=${CalendarName}`
const fetchAllSeasons = async()=>{
  setLoading(true);
  try {
    const accessToken = await fetchAccessToken();
    const response = await fetch(SeasonUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile headers");
    }
    const responseData = await response.json();
    setseasondata(responseData.data);
    setOriginalSeasondata(responseData.data)
    console.log("Fetched Data:", responseData.data);
  } catch (error) {
    console.error("Error fetching activity calendars:", error.message);
  } finally {
    setLoading(false);
  }
}

const ColDefs=[
  {headerName:"Season",field:"Season",flex:2,width:100},
  {headerName:"Start time",field:"Start time",flex:2,width:100},
  {headerName:"Week",field:"Week",flex:2,width:100},
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
              width: 100}
]

const exportExcel = async () => {
await fetchAllSeasons();
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Activity Calendars Week data');
const headers = ['Season','Start time','Week'];
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
seasondata.forEach((data) => {
worksheet.addRow([
data.Season,
data['Start time'],
data.time
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
const buffer = await workbook.xlsx.writeBuffer()
const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
saveAs(blob, 'Season.xlsx');
};
          
            
          
const exportCSV = async () => {
await fetchAllSeasons();
const worksheet = XLSX.utils.json_to_sheet(seasondata);
const csv = XLSX.utils.sheet_to_csv(worksheet);
saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Season.csv");
};
          
const exportPDF = async () => {
await fetchAllSeasons();
const doc = new jsPDF();
doc.text("Activity Calendars Seasons data", 20, 10);
doc.autoTable({
head: [
[
  'Season','Start time','Week'
],
],
body: seasondata.map((data) => [
data.Season,
data['Start time'],
data.time
]),
});
doc.save("Season.pdf");
};
      
            
            
const copyData = () => {
let textData = "Season\tStart time\ttime\n"; 
textData += seasondata.map(row => 
`t${row.Season}\t${row['Start time']}\t${row.time}`
 ).join("\n");
navigator.clipboard.writeText(textData)
.then(() => alert("Data copied to clipboard!"))
.catch((error) => alert("Failed to copy data: " + error));
            };
            
        
            const searchData = () => {
              if (!searchKey.trim()) {
                setseasondata(OriginalSeasondata); 
              } else {
                const filteredData = OriginalSeasondata.filter((row) =>
                  Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(searchKey.toLowerCase())
                  )
                );
                setseasondata(filteredData);
              }
            };
      
return (
  <div>
    <Form>
      <Row className="mt-4">
        <Col md={4}>
          <Form.Group className="mb-3" controlId="season">
            <Form.Label style={{ fontSize: "15px" }}>
              Season <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3" controlId="week">
            <Form.Label style={{ fontSize: "15px" }}>
              Week <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select>
              <option value="">-NA-</option>
              {weekdrop.map((item, index) => (
                <option key={index} value={item.Week}>
                  {item.Week}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>
              <span className="text-danger">*</span> Start Date
            </Form.Label>
            <Form.Control
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Wildcard Section */}
      <Form.Label>
        <strong>Wildcard:</strong>
      </Form.Label>
      <div>
        <Form.Check inline label="Year" type="checkbox" id="checkbox-year" />
        <Form.Check inline label="Month" type="checkbox" id="checkbox-month" />
        <Form.Check inline label="Day" type="checkbox" id="checkbox-day" />
        <Form.Check inline label="Day of Week" type="checkbox" id="checkbox-dayofweek" />
      </div>

      {/* Buttons Section */}
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-md mr-1"
          style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}
        >
          Add
        </button>
      </div>

      <div className="container-fluid col-12">
        <div className="d-flex flex-wrap mt-4">
          <div className="d-flex flex-wrap" style={{ marginLeft: "1vw", gap: "1vw" }}>
            <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportExcel}>
              Excel
            </button>
            <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportPDF}>
              PDF
            </button>
            <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportCSV}>
              CSV
            </button>
            <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={copyData}>
              Copy
            </button>
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
            rowData={seasondata}
            columnDefs={ColDefs} 
            pagination={true}
            rowSelection="multiple"
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 30, 40]}
            onSelectionChanged={(event) => {
              const selectedRows = event.api.getSelectedRows();
              console.log("Selected Rows:", selectedRows);
            }}
            overlayLoadingTemplate={
              `<div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: rgba(255, 255, 255, 0.8);">
                <img src="loadingGif" alt="Loading..." style="width: 50px; height: 50px;" />
              </div>`
            }
            overlayNoRowsTemplate={`<span class="ag-overlay-no-rows-center">No rows to display</span>`}
            onGridReady={(params) => {
              if (loading) {
                params.api.showLoadingOverlay();
              } else {
                params.api.hideOverlay();
              }
            }}
          />
        </div>
      </div>

      <div className="d-flex justify-content-center gap-5 mt-5">
        <button className="btn btn-md" style={{ backgroundColor: "#5cb0e7", color: "white" }}>
          Save
        </button>
        <button className="btn btn-md" style={{ backgroundColor: "#5cb0e7", color: "white" }} onClick={handleCancelClick}>
          Back
        </button>
      </div>
    </Form>
  </div>
);
};

export default SeasonConfiguration;