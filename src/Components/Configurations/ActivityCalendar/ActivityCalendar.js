import {useState,useEffect} from "react"
import {AgGridReact} from "ag-grid-react";
import {Row,Col,Button,Form} from "react-bootstrap";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { BsFillTrashFill } from 'react-icons/bs';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDropzone } from 'react-dropzone';
import loadingGif from '../../../Assets/img2.gif'

function ActivityCalendar({onCalendarName,onNewTab}){
   
    const[Calendardata,setCalendardata] = useState([]);
    const[loading,setLoading] = useState(false);
     

    const ColumnDefs=[
        {headerName:"",field:"checkbox", checkboxSelection:true,flex:2,width:100},
        {headerName:"CALENDAR",field:"CALENDER",flex:2,width:100,onCellClicked: (params) => {console.log(params.data);
          onCalendarName({ id: params.data })},cellClass: "blue-cell"},
        {headerName:"MANUFACTURER",field:"MANUFACTURER",flex:2,width:100},
        {headerName:"TYPE",field:"TYPE",flex:2,width:100},
        {headerName:"",field:"actions",cellRenderer:(params)=>{
            return(
        <div>
         <span style={{cursor:"pointer"}} title="Delete Row">
             <BsFillTrashFill style={{color:'red'}}/>
         </span>
        </div>
        );
    },flex:2,width:100},
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

    const gridurl="/api/server3/UHES-0.0.1/WS/getDynActivityCalendarList";
    const fetchAllactivityCalendars = async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(gridurl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch profile headers");
          }
          const responseData = await response.json();
          setCalendardata(responseData.data);
          console.log("Fetched Data:", responseData.data);
        } catch (error) {
          console.error("Error fetching activity calendars:", error.message);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchAllactivityCalendars();
      }, []);
    
      const exportExcel = async () => {
        await fetchAllactivityCalendars();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Calendars');
        const headers = ['CALENDARNAME','METERMANUFACTURE','METERTYPE'];
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
        Calendardata.forEach((data) => {
          worksheet.addRow([
            data.CALENDER,
            data.MANUFACTURER,
            data.TYPE
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
        saveAs(blob, 'ActivityCalendars.xlsx');
      };
    
    
    
      const exportCSV = async () => {
        await fetchAllactivityCalendars();
        const worksheet = XLSX.utils.json_to_sheet(Calendardata);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "ActivityCalendars.csv");
      };
    
      const exportPDF = async () => {
        await fetchAllactivityCalendars();
        const doc = new jsPDF();
        doc.text("Activity Calendars Data", 20, 10);
        doc.autoTable({
          head: [
            [
              'CALENDARNAME',
              'METERMANUFACTURE',
              'METERTYPE'
            ],
          ],
          body: Calendardata.map((data) => [
            data.CALENDER,
            data.MANUFACTURER,
            data.TYPE
          ]),
        });
        doc.save("ActivityCalendars.pdf");
      };

      
      const exportXML = async () => {
        await fetchAllactivityCalendars();
        let xmlData = `<?xml version="1.0" encoding="UTF-8"?>\n<ActivityCalendars>\n`;
        Calendardata.forEach((data) => {
          xmlData += `  <Calendar>\n`;
          xmlData += `    <CALENDARNAME>${data.CALENDER}</CALENDARNAME>\n`;
          xmlData += `    <METERMANUFACTURE>${data.MANUFACTURER}</METERMANUFACTURE>\n`;
          xmlData += `    <METERTYPE>${data.TYPE}</METERTYPE>\n`;
          xmlData += `  </Calendar>\n`;
        });
        xmlData += `</ActivityCalendars>`;
        const blob = new Blob([xmlData], { type: "application/xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "ActivityCalendars.xml";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
   
    return(
      <div>
      <div className="align-items-center m-1">
        <div className="container-fluid ag-theme-quartz  mx-auto"
        style={{ height:500, width: "100%" }}>
            <AgGridReact
            columnDefs={ColumnDefs}
            rowData={Calendardata}
            pagination={true}
            rowSelection="multiple"
            paginationPageSize={10}
            paginationPageSizeSelector={[10,20,30,40]}
            OnSelectionChanged={(event)=>{
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
        </div>
        <Row className="justify-content-end">
        <Col xs="auto">
          <Button variant="text" size="md"  style={{ color: "#00008b" }} onClick={exportExcel}>
            excel
          </Button>
          <Button variant="text" size="md" style={{ color: "#00008b" }} onClick={exportPDF}>
            PDF
          </Button>
          <Button variant="text" size="md" style={{ color: "#00008b" }} onClick={exportCSV}>
            CSV
          </Button>
          <Button variant="text" size="md" className="m-1" onClick={exportXML}>
            XML
          </Button>
        </Col>
      </Row>
        <Row className="justify-content-start mt-3">
          <Col xs="auto">
          <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }} onClick={onNewTab}>New</button>
          </Col>
         </Row>
         </div>
    )
}
export default ActivityCalendar