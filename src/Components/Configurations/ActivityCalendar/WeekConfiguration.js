import {Container,Row,Col,Button,Form,InputGroup} from "react-bootstrap";
import  { useState,useEffect } from "react";
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


function WeekConfiguration({onCancel,tabKey,parentTab,CalendarName  }){
    const [date, setDate] = useState("");
    const[WeekData,setWeekData]=useState([]);
    const [searchKey,setSearchKey]=useState();
    const [originalWeekData,setOriginalWeekData] = useState([]);
    const[loading,setLoading]=useState(false)
    const[dropdown,setdropdown]=useState([])

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
    
      const daydropdown=`/api/server3/UHES-0.0.1/WS/getDaysAndZonesByCalendarName?calendername=${CalendarName}`
      const fetchdaydropdown=async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(daydropdown, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch profile headers");
          }
          const responseData = await response.json();
          setdropdown(responseData.data)
          console.log(responseData.data);
         } catch (error) {
          console.error("Error fetching activity calendars:", error.message);
        } finally {
          setLoading(false);
        }
      };

      useEffect(()=>{
        fetchdaydropdown()
      },[])

      const WeekUrl=`/api/server3/UHES-0.0.1/WS/getWeekJsonDataByCalenderName?calendername=${CalendarName}`
      const fetchAllWeeks = async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(WeekUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch profile headers");
          }
          const responseData = await response.json();
          setWeekData(responseData.data)
          setOriginalWeekData(responseData.data)
          console.log(responseData.data);
         } catch (error) {
          console.error("Error fetching activity calendars:", error.message);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(()=>{
        fetchAllWeeks()
      },[])

     const WeekDefs=[
      {headerName:"Week",field:"Week",flex:2,width:100},
      {headerName:"Day1",field:"Day1",flex:2,width:100},
      {headerName:"Day2",field:"Day2",flex:2,width:100},
      {headerName:"Day3",field:"Day3",flex:2,width:100},
      {headerName:"Day4",field:"Day4",flex:2,width:100},
      {headerName:"Day5",field:"Day5",flex:2,width:100},
      {headerName:"Day6",field:"Day6",flex:2,width:100},
      {headerName:"Day7",field:"Day7",flex:2,width:100},
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
              await fetchAllWeeks();
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Activity Calendars Week data');
              const headers = ['Week','Day1','Day2','Day3','Day4','Day5','Day6','Day7'];
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
              WeekData.forEach((data) => {
                worksheet.addRow([
                  data.Week,
                  data.Day1,
                  data.Day2,
                  data.Day3,
                  data.Day4,
                  data.Day5,
                  data.Day6,
                  data.Day7
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
              saveAs(blob, 'Weekdata.xlsx');
            };
          
            
          
            const exportCSV = async () => {
              await fetchAllWeeks();
              const worksheet = XLSX.utils.json_to_sheet(WeekData);
              const csv = XLSX.utils.sheet_to_csv(worksheet);
              saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Weekdata.csv");
            };
          
            const exportPDF = async () => {
              await fetchAllWeeks();
              const doc = new jsPDF();
              doc.text("Activity Calendars Week Data", 20, 10);
              doc.autoTable({
                head: [
                  [
                    'Week','Day1','Day2','Day3','Day4','Day5','Day6','Day7'  
                  ],
                ],
                body: WeekData.map((data) => [
                  data.Week,
                  data.Day1,
                  data.Day2,
                  data.Day3,
                  data.Day4,
                  data.Day5,
                  data.Day6,
                  data.Day7
                ]),
              });
              doc.save("Weekdata.pdf");
            };
      
            
            const copyData = () => {
              let textData = "Week\tDay1\tDay2\tDay3\tDay4\tDay5\tDay6\tDay7\n"; 
              textData += WeekData.map(row => 
                `${row.Week}\t${row.Day1}\t${row.Day2}\t${row.Day3}\t${row.Day4}\t${row.Day5}\t${row.Day6}\t${row.Day7}`
              ).join("\n");
            
              navigator.clipboard.writeText(textData)
                .then(() => alert("Data copied to clipboard!"))
                .catch((error) => alert("Failed to copy data: " + error));
            };
            
        
            const searchData = () => {
              if (!searchKey.trim()) {
                setWeekData(originalWeekData); 
              } else {
                const filteredData = originalWeekData.filter((row) =>
                  Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(searchKey.toLowerCase())
                  )
                );
                setWeekData(filteredData);
              }
            };
      
        
      return (
        <div>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="week">
                  <Form.Label style={{ fontSize: "15px" }}>
                    Week <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control type="text" />
                </Form.Group>
              </Col>
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
      <Col md={4} key={index}>
        <Form.Group className="mb-3" controlId={`day-${day.toLowerCase()}`}>
          <Form.Label style={{ fontSize: "15px" }}>
            {day} <span style={{ color: "red" }}>*</span>
          </Form.Label>
          <Form.Select>
            <option value="">-NA-</option>
            {dropdown.map((item, idx) => (
              <option key={idx} value={item.Days}>
                {item.Days}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    ))}
  </Row>
          </Form>
          <div className="container-fluid col-12">
            <div className="d-flex flex-wrap mt-4">
              <div className="d-flex flex-wrap" style={{ marginLeft: "1vw", gap: "1vw" }}>
                <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportExcel}>
                  Excel
                </Button>
                <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportPDF}>
                  PDF
                </Button>
                <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={exportCSV}>
                  CSV
                </Button>
                <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={copyData}>
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
                rowData={WeekData}
                columnDefs={WeekDefs}
                pagination={true}
                rowSelection="multiple"
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 30, 40]}
                onSelectionChanged={(event) => {
                  const selectedRows = event.api.getSelectedRows();
                  console.log("Selected Rows:", selectedRows);
                }}
                overlayLoadingTemplate={
                  `<div style="
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
    
            <div className="d-flex justify-content-center">
              <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}>Add</Button>
            </div>
    
            <div className="d-flex justify-content-center gap-5 mt-5">
              <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}>Save</Button>
              <Button style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={handleCancelClick}>
                Back
              </Button>
            </div>
          </div>
        </div>
      );
    };
    
    export default WeekConfiguration;