import {useState,useEffect} from "react"
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
import {Form,Row,Col,Button, Container,InputGroup} from 'react-bootstrap';



function Week({active,CalendarName,onAddUpdate,metertypeId,manufactureId}){
    const [searchKey,setSearchKey]=useState();
    const[weekdata,setweekdata]=useState([]);
    const [originalWeekData,setOriginalWeekData] = useState([]);
    const[loading,setLoading]=useState(false)

    const WeekDefs=[
        {headerName:"Week",field:"Week",flex:2,width:100},
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
  
    const weekurl=`/api/server3/UHES-0.0.1/WS/getWeekJsonDataByCalenderName?calendername=${CalendarName}`
    const fetchAllWeeks = async () => {
      setLoading(true);
      try {
        const accessToken = await fetchAccessToken();
        const response = await fetch(weekurl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch profile headers");
        }
        const responseData = await response.json();
        setweekdata(responseData.data);
        setOriginalWeekData(responseData.data)
        console.log("Fetched Data:", responseData.data);
      } catch (error) {
        console.error("Error fetching activity calendars:", error.message);
      } finally {
        setLoading(false);
       
      }
    };
  
    useEffect(() => {
      if (active) {
        fetchAllWeeks();
      }
    }, [active]);

   
    const exportExcel = async () => {
        await fetchAllWeeks();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Calendars Week data');
        const headers = ['Week'];
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
        weekdata.forEach((data) => {
          worksheet.addRow([
            data.Week
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
        const worksheet = XLSX.utils.json_to_sheet(weekdata);
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
                'Week'
            ],
          ],
          body: weekdata.map((data) => [
            data.Week
          ]),
        });
        doc.save("Weekdata.pdf");
      };

      
      const copyData = () => {
        let textData = "Week\n";
            textData += weekdata
                .map(row => `${row.Week}`) 
                .join("\n"); 
            navigator.clipboard.writeText(textData)
                .then(() => alert("Data copied to clipboard!"))
                .catch((error) => alert("Failed to copy data: " + error));
    };
      
  
      const searchData = () => {
        if (!searchKey.trim()) {
          setweekdata(originalWeekData); 
        } else {
          const filteredData = originalWeekData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          setweekdata(filteredData);
        }
      };

  
    return(
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
             rowData={weekdata}
          columnDefs={WeekDefs}
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
        }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button className="btn btn-md mr-1" style={{ backgroundColor: "#5cb0e7", borderColor: "#5cb0e7", color: "white" }}   onClick={() => onAddUpdate(metertypeId, manufactureId)}>
            Add
          </button>
        </div>
        </div>
    )
}
export default Week