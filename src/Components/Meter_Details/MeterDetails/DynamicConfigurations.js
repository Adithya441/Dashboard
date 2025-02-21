import { useState, useEffect } from "react";
import {Modal,Button} from "react-bootstrap";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from 'ag-grid-community';
import loadingGif from '../../../Assets/img2.gif';
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaCheckCircle } from "react-icons/fa";

const DynamicConfigurations = ({ meternum, meterty, meterman }) => {
  const [configType, setConfigType] = useState();
  const [configOptions, setConfigOptions] = useState([]);
  const [editConfig, seteditConfig] = useState();
  const [meterData, setMeterData] = useState();
  const [rowData, setRowData] = useState([]);
  const [operationMode, setOperationMode] = useState("GET");
  const [valueInput, setValueInput] = useState("");
  const [searchKey, setSearchKey] = useState();
  const[show,setShow]=useState(false);
  const [showModal, setShowModal] = useState(false);
  const[dynamicConfigurations,setdynamicConfigurations]=useState([]);
  const[loading,setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [colDefs, setColDefs] = useState([
    { field: 'transactionId', filter: true, headerName: "Transaction ID",valueFormatter:(params)=>{return params.value||"-"}},
    { field: 'type', filter: true, headerName: "Type",valueFormatter:(params)=>{return params.value||"-"} },
    { field: 'requestTime', filter: true, headerName: "Request Time", valueFormatter: (params) =>{return  formatDateTime(params.value)||"-" }},
    { field: 'responseFrom', filter: true, headerName: "Request From" ,valueFormatter:(params)=>{return params.value||"-"}},
    { field: 'response', filter: true, headerName: "Response" ,valueFormatter:(params)=>{return params.value||"-"}},
    { field: 'responseTime', filter: true, headerName: "Response Time", valueFormatter: (params) => {return formatDateTime(params.value)||"-" }},
    {
      field: "responseCode",
      filter: true,
      headerName: "Status",
      cellRenderer: (params) => {
        if (!params.value) return "--"; 
        const div = document.createElement("div");
        div.innerHTML = params.value;
        const text = div.textContent || div.innerText; 
        const boldTag = div.querySelector("b"); 
        const color = boldTag?.style.color || "black"; 
        return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
      }
    }   
  ]);


  const handleShow = () => setShow(true);

  //SERVICE URLS
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const configsUrl = `/api/server3/UHES-0.0.1/WS/getConfigurationsBasedOnClassId?ClassId=${configType}&Flag=${operationMode}&MeterMake=${meterman}&MeterType=${meterty}`;
  //GENERATING GRID SERVICE URL DYNAMICALLY
  const buildGridUrl = () => {
    const params = new URLSearchParams({
      MeterNo: meternum,
    });
    if (editConfig) params.append("commandType", editConfig);
    if (operationMode) params.append("method", operationMode);
    if (valueInput) params.append("value", valueInput);
    return `/api/server3/UHES-0.0.1/WS/getAllMeterStatusJobDetailsBasedOnMeterNo?${params.toString()}`;
  };
  console.log(valueInput);
  //SERVICE CALLS
  const fetchConfigOptions = async () => {
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const dataResponse = await fetch(configsUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();

      setConfigOptions(Array.isArray(responseData.data) ? responseData.data : Array(responseData.data));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchConfigOptions();
  }, [configType, operationMode]);
  
  const fetchGridData = async () => {
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      if (!tokenResponse.ok) throw new Error('Failed to authenticate');
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const dataResponse = await fetch(buildGridUrl(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setRowData(responseData.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect (()=>{
    fetchGridData()
  },[])

  const actcalgetsetUrl="/api/server3/UHES-0.0.1/WS/DynamicConfigrationRequestWithDLMS";
  const fetchgetsetCalendars = async () => {
    setLoading(true);
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });
  
      if (!tokenResponse.ok) throw new Error("Failed to authenticate");
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const requestBody = {
        commandType: editConfig,  
        meterno: meternum,       
        method: operationMode,   
        userid: "Jahnavi",        
        value: valueInput,        
      };
      console.log("Sending Request:", requestBody);
      const response = await fetch(actcalgetsetUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(requestBody), 
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile headers");
      }
      const responseData = await response.json();
      console.log("Fetched Data:", responseData.data);
      const extractedTransactionId = responseData.data[0].transactionId;
      console.log(extractedTransactionId);
      setTransactionId(extractedTransactionId);
      setdynamicConfigurations(responseData.data);
      await fetchGridData();
    } catch (error) {
      console.error("Error fetching activity calendars:", error.message);
    } finally {
      setLoading(false);
    }
  };
  

 

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

const stripHtml = (html) => {
  if (!html) return ""; 
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const exportCSV = () => {
  const csvData = rowData.map(row => ({
      TransactionID: row.transactionId,
      Type: row.type,
      RequestTime: formatForExcel(row.requestTime), // Fix applied here
      RequestFrom: row.responseFrom,
      Response: row.response,
      ResponseTime: formatForExcel(row.responseTime), // Fix applied here
      Status: stripHtml(row.responseCode)
  }));

  const csvContent = [
      Object.keys(csvData[0]).join(','), 
      ...csvData.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'DynamicConfiguration.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const formatForExcel = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ` +
         `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};


const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dynamic Configuration');

    const headers = ['Transaction ID','Type','Request Time','Response From','Response','Response Time','Status'];
    const title = worksheet.addRow(['Dynamic Configuration']);
    title.font = { bold: true, size: 16, color: { argb: 'FFFF00' } };
    title.alignment = { horizontal: 'center' };
    worksheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);

    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFADD8E6' },
        };
    });

    rowData.forEach(row => {
        worksheet.addRow([
            row.transactionId,
            row.type,
            formatDateTime(row.requestTime),
            row.responseFrom,
            row.response,
            formatDateTime(row.responseTime),
            stripHtml(row.responseCode)
        ]);
    });

    worksheet.autoFilter = {
        from: 'A2',
        to: `${String.fromCharCode(64 + headers.length)}2`
    };

    headers.forEach((header, index) => {
        const maxLength = Math.max(
            header.length,
            ...rowData.map(row => row[header] ? row[header].toString().length : 0)
        );
        worksheet.getColumn(index + 1).width = maxLength + 10;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `DynamicConfiguration.xlsx`);
};

const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Transaction ID", "Type", "Request Time", "Request From", "Response", "Response Time", "Status"];
    const tableRows = [];

    rowData.forEach(row => {
        tableRows.push([
            row.transactionId,
            row.type,
            formatDateTime(row.requestTime),
            row.responseFrom,
            row.response,
            formatDateTime(row.responseTime),
            stripHtml(row.responseCode)
        ]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('DynamicConfiguration.pdf');
};

const copyData = () => {
    const textData = rowData
        .map(row =>
            `${row.transactionId}\t${row.type}\t${formatDateTime(row.requestTime)}\t${row.responseFrom}\t${row.response}\t${formatDateTime(row.responseTime)}\t${stripHtml(row.responseCode)}`
        )
        .join("\n");

    navigator.clipboard.writeText(textData)
        .then(() => alert("Data copied to clipboard!"))
        .catch((error) => alert("Failed to copy data: " + error));
};

  const searchData = (e) => {
    const searchValue = e.target.value;
    setSearchKey(searchValue);
    if (searchValue === "") {
      setRowData(rowData);
    } else {
      const filteredData = rowData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setRowData(filteredData);
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setShowModal(false);
  };


  return (
    <div className="container-fluid col-12">
      <form className="col-12">
        <div className="d-flex justify-content-center mb-4">
          <div className="form-check mx-3">
            <input
              className="form-check-input"
              type="radio"
              name="gridRadios"
              id="gridRadios1"
              value="GET"
              checked={operationMode === "GET"}
              onChange={(e) => setOperationMode(e.target.value)}
            />
            <label className="form-check-label" htmlFor="gridRadios1">
              Get
            </label>
          </div>
          <div className="form-check mx-3">
            <input
              className="form-check-input"
              type="radio"
              name="gridRadios"
              id="gridRadios2"
              value="SET"
              checked={operationMode === "SET"}
              onChange={(e) => setOperationMode(e.target.value)}
            />
            <label className="form-check-label" htmlFor="gridRadios2">
              Set
            </label>
          </div>
        </div>
        <div className="d-flex justify-content-center gap-4 mb-4">
          <div className="col-lg-4">
            <label htmlFor="Configurations">Configurations</label>
            <div className="input-group">
              <div className="border border-left-danger border-left-5" ></div>
              <select
                id="Configurations"
                value={configType}
                className="form-control border border-left-3 border-left-danger"
                onChange={(e) => {
                  setConfigType(e.target.value);
                  console.log(e.target.value);
                }}
              >
                <option>-NA-</option>
                <option value="1">Data</option>
                <option value="8">Clock</option>
                <option value="9">Script Table</option>
                <option value="20">Activity Calendar</option>
                <option value="22">Single Action Object</option>
                <option value="40">IP Address</option>
                <option value="70">Disconnect Control</option>
                <option value="71">Limiter</option>
                <option value="115">Token Gateway</option>
                <option value="112">Credit</option>
                <option value="113">Charge</option>
                <option value="111">Account</option>
                <option value="11">Special Day</option>
              </select>
            </div>
          </div>
          <div className="col-lg-4">
            <label htmlFor="editConfig">Get/Set Configurations</label>
            <div className="input-group">
              <div className="border border-left-danger border-left-5" ></div>
              <select
                id="editConfig"
                value={editConfig}
                className="form-control border border-left-3 border-left-danger"
                onChange={(e) => seteditConfig(e.target.value)}
              >
                <option>-NA-</option>
                {(configOptions || []).map((confOpt, index) => (
                  <option key={index} value={confOpt.OBISNAME}>
                    {confOpt.OBISNAME}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {operationMode === "SET" && (
          <div className="col-lg-4 mx-auto mb-4">
            <label htmlFor="valueInput">Value</label>
            <div className="input-group">
              <div className="border border-left-danger border-left-5" ></div>
              <input
                type="number"
                id="valueInput"
                className="form-control border border-left-3 border-left-danger"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="text-center">
          <button
            className="btn btn-primary"
            style={{backgroundColor:'#5cb0e7'}}
            onClick={(e) => {
              e.preventDefault();
              fetchgetsetCalendars();
              setShowModal(true);
            }}
          >
            Submit Request
          </button>
        </div>
      </form>
      <div className="text-center col-12">
        {rowData ? (
          <div className="container-fluid col-12">
            <div className="d-flex flex-wrap justify-content-between mt-4">
              <div className="d-flex flex-wrap gap-2" style={{ marginLeft: '1vw' }}>
                <button className="btn btn-primary btn-md" onClick={exportExcel} style={{backgroundColor:'#5cb0e7'}}>Excel</button>
                <button className="btn btn-primary btn-md" onClick={exportPDF} style={{backgroundColor:'#5cb0e7'}}>PDF</button>
                <button className="btn btn-primary btn-md" onClick={exportCSV} style={{backgroundColor:'#5cb0e7'}}>CSV</button>
                <button className="btn btn-primary btn-md" onClick={copyData} style={{backgroundColor:'#5cb0e7'}}>Copy</button>
              </div>
              <div style={{ marginRight: '1vw' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="search"
                  value={searchKey}
                  onChange={searchData}
                />
              </div>
            </div>
            <div
              className="col-12 ag-theme-quartz mx-auto mt-3"
              style={{ height: 350, width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10,20,30,40,50]}
                modules={[ClientSideRowModelModule]}
                overlayLoadingTemplate={`<div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: rgba(255, 255, 255, 0.8);">
            <img src="${loadingGif}" alt="Loading..." style="width: 50px; height: 50px;" /></div>`} overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">No rows to display</span>'}
            onGridReady={(params) => { if (loading) {params.api.showLoadingOverlay();} else {params.api.hideOverlay();}}}
            />
            </div>
          </div>
        ) : (
          <div className="mt-4 col-md-10 text-center text-danger mx-auto">
            {loading}
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
      <Button variant="primary" style={{ textAlign: "center",backgroundColor:'#5cb0e7' }} onClick={handleClose}>
        OK
      </Button>
    </Modal.Footer>
      </Modal>
      </div>
    </div>
  );
}

export default DynamicConfigurations;