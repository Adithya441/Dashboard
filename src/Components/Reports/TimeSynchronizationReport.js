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
import loadingGif from '../../Assets/img2.gif'
import { Search } from "react-bootstrap-icons";

function TimeSynchronizationReport() {
    const[fromDate,setFromDate]=useState("");
    const[toDate,setToDate]=useState("");
    const[transactionId,settransactionId]=useState([])
    const[selectedtransactionId,setselectedtransactionId]=useState("");
    const[loading,setLoading]=useState(false);
    const[Timeddata,setTimeddata]=useState([]);
    const[submitted,setsubmitted]=useState(false);
    const[searchKey,setSearchKey]=useState('');
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
   const toDate1 = toDate.replace(/-/g, ""); 
   const transactionUrl = `/api/server3/UHES-0.0.1/WS/getTransactionIdBetweenDates?fromDate=${fromDate1}&toDate=${toDate1}`;
   const fetchAlltransactionId = async () => {
      setLoading(true);
      try {
        const accessToken = await fetchAccessToken();
        const response = await fetch(transactionUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch device Masters");
        }
        const responseData = await response.json();
        settransactionId(responseData.data);
        console.log("Fetched Data:", responseData.data);
      } catch (error) {
        console.error("Error fetching device Masters:", error.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(()=>{
        fetchAlltransactionId();
    },[])

    const gridUrl=`/api/server3/UHES-0.0.1/WS/getTimeSynchronizationReport?fromDate=${fromDate1}&toDate=${toDate1}`
    const fetchAlltimedSynchronization = async () => {
        setLoading(true);
        try {
          const accessToken = await fetchAccessToken();
          const response = await fetch(gridUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch device Masters");
          }
          const responseData = await response.json();
          setTimeddata(responseData.data);
          setOriginalData(responseData.data);
          console.log(responseData.data);
          console.log("Fetched Data:", responseData.data);
        } catch (error) {
          console.error("Error fetching device Masters:", error.message);
        } finally {
          setLoading(false);
        }
      };

      const exportExcel = async () => {
        await fetchAlltimedSynchronization();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('TimeSynchronization');
        const headers = ['Time Sync Date','Meter Number','Meter Time','Set Time']
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
        });
        Timeddata.forEach((data) => {
            worksheet.addRow([
                data.REQUEST_TIME,
                data.METER_NUMBER,
                data.METER_TIME,
                data.DATE_TIME
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
        worksheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + headers.length)}2` };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'TimeSynchronizationReport.xlsx');
    };
    
    const exportCSV = async () => {
        await fetchAlltimedSynchronization();
        const worksheet = XLSX.utils.json_to_sheet(Timeddata);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'TimeSynchronizationReport.csv');
    };
    
    const exportPDF = async () => {
        await fetchAlltimedSynchronization();
        const doc = new jsPDF();
        doc.text("Meter Details Data", 20, 10);
        doc.autoTable({
            head: [['Time Sync Date','Meter Number','Meter Time','Set Time']
          ],
            body: Timeddata.map((data) => [
                data.REQUEST_TIME,
                data.METER_NUMBER,
                data.METER_TIME,
                data.DATE_TIME
              ]),
            startY: 20,
        });
        doc.save("TimeSynchronizationReport.pdf");
    };

    

  
      const handleSubmit = (event) => {
        event.preventDefault();
        fetchAlltimedSynchronization();  
        setsubmitted(true);
      };

     const ColumnDefs=[
         {headerName: "Time Sync Date", field: "REQUEST_TIME",flex: 2, minWidth: 200, maxWidth: 350,filter: true ,valueFormatter:(params)=>params.value?params.value:"--"},
         {headerName: "Meter Number", field: "METER_NUMBER",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
         {headerName: "Meter Time", field: "METER_TIME",flex: 2, minWidth: 200, maxWidth: 350,filter: true },
         {headerName: "Set Time", field: "DATE_TIME",flex: 2, minWidth: 200, maxWidth: 350,filter: true,valueFormatter:(params)=>params.value?params.value:"--"}
     ]

     const searchData = () => {
        if (!searchKey.trim()) {
            setselectedtransactionId(originalData); 
        } else {
          const filteredData = originalData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          setselectedtransactionId(filteredData);
        }
      };

     
    return (
        <Fragment>
            <Container fluid>
                <Form>
                    <Row className="m-1">
                        <Col xs={12} md={4}>
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
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>
                                    <span style={{ color: "red" }}>*</span> Transaction ID
                                </Form.Label>
                                <Form.Select
                                type="text"
                                value={selectedtransactionId}
                                onChange= {(e) =>  
                               setselectedtransactionId(e.target.value)}
                                >   
                                <option value="">-NA-</option>
                                {transactionId.map((transactionid, index) => (
                                <option key={index} value={transactionid.TRANSACTION_ID}>
                                {transactionid.JOB_ID}
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
           {Timeddata && submitted &&  fromDate && toDate && (
            <div
              className="container-fluid ag-theme-quartz ms-0 me-auto"
              style={{ height:500, width: "92vw" }}
            >
              <AgGridReact
                rowData={Timeddata}
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
        
    );
}

export default TimeSynchronizationReport;