import { useState, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from 'ag-grid-community';

import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PowerConnectDisconnect = ({ meternum }) => {
  const [reasonType, setReasonType] = useState();
  const [commentValue, setCommentValue] = useState();
  const [meterStatus, setMeterStatus] = useState('Disconnected');
  const [rowData, setRowData] = useState();
  const [searchKey, setSearchKey] = useState();
  const [loadingStatus,setLoadingStatus]=useState('Loading Data');
  const [colDefs] = useState([
    { field: "transactionId", filter: true, headerName: "Transaction Id" },
    { field: "comments", filter: true, headerName: "Comments" },
    { field: "reason", filter: true, headerName: "Reason" },
    { field: "responseFrom", filter: true, headerName: "Request From" },
    { field: "requestTime", filter: true, headerName: "Request Time" ,valueFormatter: (params) =>{return  formatDateTime(params.value)||"-" }},
    { field: "responseTime", filter: true, headerName: "Response Time", valueFormatter:(params)=>{return params.value||"--"},valueFormatter: (params) =>{return  formatDateTime(params.value)||"-" } },
    { field: "responseCode", filter: true, headerName: "Response Code" ,cellRenderer: (params) => {
      if (!params.value) return "-"; 
      const div = document.createElement("div");
      div.innerHTML = params.value;
      const text = div.textContent || div.innerText; 
      const boldTag = div.querySelector("b"); 
      const color = boldTag?.style.color || "black"; 
      return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
    }}
  ]);
  //SERVICE URLS
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const gridUrl = `/api/server3/UHES-0.0.1/WS/getMeterConnectDisconnectData?meterno=${meternum}`;

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

      const dataResponse = await fetch(gridUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setRowData(responseData.data || []);
      if((responseData.data).length==0){
        setLoadingStatus('Data not found');
      }
      console.log('service data:', (responseData.data));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchGridData();
  }, []);

  const exportCSV = () => {
    const csvData = rowData.map(row => ({
      TransactionId: row.transactionId,
      Comments: row.comments,
      Reason: row.reason,
      RequestFrom: row.responseFrom,
      RequestTime: row.requestTime,
      ResponseTime: row.responseTime,
      ResponseCode: stripHtml(row.responseCode)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Configurations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    const headers = Object.keys(rowData[0] || {});
    const title = worksheet.addRow([`Meter Connect Disconnect Data`]);
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

    rowData.forEach((row) => {
      worksheet.addRow(
        headers.map((header) =>
          header === "responseCode" ? stripHtml(row[header]) : row[header]
        )
      );
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
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'PowerConnectDisconnect.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Transaction Id", "Comments", "Reason", "Request From", "Request Time", "Response Time", "Response Code"];
    const tableRows = [];

    rowData.forEach(row => {
      tableRows.push([row.transactionId, row.comments, row.reason, row.responseFrom, row.requestTime, row.responseTime, stripHtml(row.responseCode)]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('PowerConnectDisconnect.pdf');
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
  }
  const copyData = () => {
    const textData = rowData
      .map(row =>
        `${row.transactionId}\t${row.comments}\t${row.reason}\t${row.responseFrom}\t${row.requestTime}\t${row.responseTime}\t${row.responseCode}`
      )
      .join("\n");
    navigator.clipboard.writeText(textData)
      .then(() => alert("Data copied to clipboard!"))
      .catch((error) => alert("Failed to copy data: " + error));
  };
  return (
    <div className='container-fluid col-xs-12'>
    <div className="col-xs-12 d-flex flex-wrap justify-content-between p-1">
      <div className="col-xs-10 col-md-4">
        <label htmlFor="reasonInput">Reason</label>
        <div className="input-group">
          <div className="border border-left-danger border-left-5" ></div>
          <select id="reasonInput" value={reasonType} className='form-control' onChange={(e) => setReasonType(e.target.value)} style={{ margin: '5px 5px' }}>
            <option value="" selected></option>
            <option value="NEW_CONNECTION">New Connection</option>
            <option value="CONNECTION_ON_SR_CARD">Connection on SR Card</option>
            <option value="PAYMENT_DONE">Payment Done</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>
      </div>
      <div className="col-xs-10 col-md-4">
        <label htmlFor="commentInput">Comment</label>
        <div className="input-group">
          <div className="border border-left-danger border-left-5" ></div>
          <textarea className="form-control" id="commentInput" rows="5" cols="20" value={commentValue} onChange={(e) => setCommentValue(e.target.value)} style={{ margin: '5px 5px' }}></textarea>
        </div>
      </div>
      <div className="col-xs-10 col-md-4 mt-2">
        <label htmlFor="meterStatusInput">Meter Status</label>
        <div className="input-group">
          <div className="border border-left-danger border-left-5" ></div>
          <input id="meterStatusInput" value={meterStatus} className="form-control" readOnly />
        </div>
      </div>
      </div>
      {/* <div className="text-center mx-auto">
        <button className="btn btn-primary btn-md" 
        onClick={(e)=>{
          e.preventDefault();
          fetchGridData();
        }}
        >GetStatus</button>
      </div> */}
      {rowData ? (
        <div className='col-12'>
          <div className="d-flex flex-wrap mt-4">
            <div className="d-flex flex-wrap" style={{ marginLeft: '1vw', gap: '1vw' }}>
              <button className="btn btn-primary btn-md mr-1" onClick={exportExcel}>Excel</button>
              <button className="btn btn-primary btn-md mr-1" onClick={exportPDF}>PDF</button>
              <button className="btn btn-primary btn-md mr-1" onClick={exportCSV}>CSV</button>
              <button className="btn btn-primary btn-md mr-1" onClick={copyData}>Copy</button>
            </div>
            <div className="align-right" style={{ marginLeft: '2vw' }}>
              <input type="text" className="form-control" placeholder="search" value={searchKey} onChange={searchData} />
            </div>
          </div>
          <div className="container-fluid ag-theme-quartz mt-3 mx-auto" style={{ height: 350, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={5}
              modules={[ClientSideRowModelModule]}
              paginationPageSizeSelector={[5, 10, 15, 20]}
            />
          </div>
        </div>
      ) :
        (
          <div className="mx-auto text-center text-danger">
            {loadingStatus}
          </div>
        )}
    </div>
  );
}

export default PowerConnectDisconnect;