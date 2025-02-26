import {useState,useEffect} from "react"
import {AgGridReact} from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import loadingGif from '../../../Assets/img2.gif'
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tabs } from "antd";
import { Search } from "react-bootstrap-icons";
import {Form,Row,Col,Button, Container,InputGroup} from 'react-bootstrap';



function Day({ active ,CalendarName,onAddUpdate,metertypeId,manufactureId }){
    console.log(CalendarName)
    console.log(metertypeId)
    console.log(manufactureId)
    const[daydata,setdaydata]=useState([]);
    const[loading,setLoading]=useState(false)
    const [searchKey,setSearchKey]=useState();
    const [activeSubTab, setActiveSubTab] = useState("dayConfig");
    const [originalDayData,setOrginalDayData] = useState([]);
    const dayUrl=`/api/server3/UHES-0.0.1/WS/getDaysAndZonesByCalendarName?calendername=${CalendarName}`
    const DayDefs=[
        {headerName:"Days",field:"Days",flex:2,width:100},
        {headerName:"Time Zone",field:"TOU_Count",flex:2,width:100}
      ]
      
    
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

    const fetchAlldays = async () => {
      setLoading(true);
      try {
        const accessToken = await fetchAccessToken();
        const response = await fetch(dayUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch profile headers");
        }
        const responseData = await response.json();
        setdaydata(responseData.data);
        setOrginalDayData(responseData.data);
        console.log(responseData.data);
       } catch (error) {
        console.error("Error fetching activity calendars:", error.message);
      } finally {
        setLoading(false);
      }
    };


    useEffect(() => {
      if (active) {
        fetchAlldays();
      }
    }, [active]);
  
  
    const exportExcel = async () => {
        await fetchAlldays();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Calendars Day data');
        const headers = ['Days','Time Zones'];
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
        daydata.forEach((data) => {
          worksheet.addRow([
            data.Days,
            data.TOU_Count
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
        await fetchAlldays();
        const worksheet = XLSX.utils.json_to_sheet(daydata);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Daydata.csv");
      };
    
      const exportPDF = async () => {
        await fetchAlldays();
        const doc = new jsPDF();
        doc.text("Activity Calendars Day Data", 20, 10);
        doc.autoTable({
          head: [
            [
                'Days',
                'Time Zones'
            ],
          ],
          body: daydata.map((data) => [
            data.Days,
            data.TOU_Count
          ]),
        });
        doc.save("Daydata.pdf");
      };

      
      const copyData = () => {
        let textData = "Days\tTime Zones\n";
            textData += daydata
                .map(row => `${row.Days}\t${row.TOU_Count}`) 
                .join("\n"); 
            navigator.clipboard.writeText(textData)
                .then(() => alert("Data copied to clipboard!"))
                .catch((error) => alert("Failed to copy data: " + error));
    };
    
      
  
      const searchData = () => {
        if (!searchKey.trim()) {
          setdaydata(originalDayData); 
        } else {
          const filteredData = originalDayData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          setdaydata(filteredData);
        }
      };

      return (
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
              rowData={daydata}
              columnDefs={DayDefs}
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
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}    onClick={() => onAddUpdate(metertypeId, manufactureId)}>
            Add/Update
          </button>
          </div>
        </div>
      );
    }
    
  export default Day