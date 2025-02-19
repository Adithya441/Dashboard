import {Form,Row,Col,Button, Container,InputGroup} from 'react-bootstrap';
import { useState, useEffect,Fragment } from "react";
import { Search } from "react-bootstrap-icons";
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
import loadingGif from '../../Assets/img2.gif'

function ExceptionReport(){
    const[submitted,setsubmitted]=useState(false);
    const [loading,setLoading]=useState();
    const[schedulers,setschedulers]=useState([])
    const [transactionId, setTransactionId] = useState("");
    const [date, setDate] = useState("");
    const[selectedschedulerId,setselectedschedulerId]= useState('');
    const[exceptiondata,setExceptiondata]=useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [originalData, setOriginalData] = useState([]);
  

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
  
 const formattedDate = date.replace(/-/g, ""); 
const fetchAllSchedulerId = async () => {
  setLoading(true);
  try {
    const accessToken = await fetchAccessToken();
    const Schedulerurl = `/api/server3/UHES-0.0.1/WS/getJobNames?fromDate=${formattedDate}&toDate=${formattedDate}`;

    const response = await fetch(Schedulerurl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch device Masters");
    }

    const responseData = await response.json();
    setschedulers(responseData.data || []);
    console.log(responseData.data);
  } catch (error) {
    console.error("Error fetching exception report:", error.message);
  } finally {
    setLoading(false);
  }
};

   useEffect(() => {
    fetchAllSchedulerId();
}, []);
     

   
    const gridurl=`/api/server3/UHES-0.0.1/WS/getReportByTransactionID?date=${formattedDate}&transactionId=${selectedschedulerId}`
    const fetchAllExceptionreport = async () => {
      setLoading(true);
      try {
        const accessToken = await fetchAccessToken();
        const response = await fetch(gridurl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch device Masters");
        }
        const responseData = await response.json();
        setExceptiondata(responseData.data);
        setOriginalData(responseData.data); 
        console.log(responseData.data);
        console.log("Fetched Data:", responseData.data);
      } catch (error) {
        console.error("Error fetching device Masters:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
      const handleSubmit = (event) => {
        event.preventDefault();
        fetchAllExceptionreport();  
        setsubmitted(true);
      };

      const exportExcel = async () => {
        await fetchAllExceptionreport(); 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Exception Report');
        const headers = ['Job Name', 'Meter Number', 'Message', 'Request Time', 'Response Time'];
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
        });
        exceptiondata.forEach((data) => {
            worksheet.addRow([
                data.JobName,
                data.MeterNumber,
                data.Message,
                data.MeterTime,
                data.ResponseStatus
            ]);
        });
        worksheet.columns = headers.map(() => ({ width: 20 })); 
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = maxLength + 6;
        });
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length },
        };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'ExceptionReport.xlsx');
    };
    
      const exportCSV = async () => {
        await fetchAllExceptionreport();
        const worksheet = XLSX.utils.json_to_sheet(exceptiondata);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'ExceptionReport.csv');
      };
     
      const exportPDF = async () => {
        await fetchAllExceptionreport();
        const doc = new jsPDF();
        doc.text("Meter Details Data", 20, 10);
        doc.autoTable({
          head: [['Job Name','Meter Number','Message','Request Time','Response Time']],
          body: exceptiondata.map((data) => [
            data.JobName,
            data.MeterNumber,
            data.Message,
            data.MeterTime,
            data.ResponseStatus
             ]),
          startY: 20,
        });
        doc.save("ExceptionReport.pdf");
      };
    
    
    
      const ColumnDefs = [
        {headerName: "Job Name", field: "JobName",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
        {headerName: "Meter Number", field: "MeterNumber",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
        {headerName: "Message", field: "Message",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
        {headerName: "Request Time", field: "MeterTime",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
        {headerName: "Response Status", field: "ResponseStatus",flex: 2, minWidth: 200, maxWidth: 350,filter: true }
      ]
  


      const searchData = () => {
        if (!searchKey.trim()) {
          setExceptiondata(originalData); 
        } else {
          const filteredData = originalData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          setExceptiondata(filteredData);
        }
      };


    return(
    <div>
        <Fragment>
        <Container fluid>
         <Form  onSubmit={handleSubmit}>
         <Row className="m-1">
        <Col xs={12} md={4} style={{ marginLeft: '-16px' }}>
         <Form.Group>
             <Form.Label><span style={{color:'red'}}>*</span>Date</Form.Label>
             <Form.Control type='date' value={date} onChange={(e)=>setDate((e.target.value))} />
         </Form.Group>
         </Col>
         <Col xs={12} md={4}>
         <Form.Group>
             <Form.Label><span style={{color:'red'}}>*</span>Scheduler ID</Form.Label>
             <Form.Select
             type="text"
             value={selectedschedulerId}
             onChange= {(e) =>  
      setselectedschedulerId(e.target.value)}
           >
           <option value="">-NA-</option>
              {schedulers.map((scheduleid, index) => (
                <option key={index} value={scheduleid.JobID}>
                  {scheduleid.JobName}
                </option>
              ))}
           </Form.Select>
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
          <Col xs={12} md={4} className="ms-auto" style={{ marginRight: "-8px" }}>
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
      <div className="align-items-center m-1 ms-0 me-auto">
           {exceptiondata && submitted && Date && selectedschedulerId && (
            <div
              className="container-fluid ag-theme-quartz ms-0 me-auto"
              style={{ height:500, width: "92vw" }}
            >
              <AgGridReact
                rowData={exceptiondata}
                columnDefs={ColumnDefs}
                pagination={true}
                rowSelection="multiple"
                paginationPageSize={10}
                suppressSizeToFit={false}
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
           )}
          </div>
        </Container>
    </Fragment>
    </div>
    )
}
export default ExceptionReport