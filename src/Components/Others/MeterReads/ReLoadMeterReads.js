import { useState, useEffect,Fragment } from "react";
import { Form, Row, Col, Button, Container, option, InputGroup } from "react-bootstrap";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import TreeSelectCmp from "../../TreeDropdown/TreeSelect";


const ReLoadMeterReads = () => {
  // const [meterManufactureOpts, setMeterManufactureOpts] = useState();
  // const [meterManfacturer, setMeterManufacturer] = useState();
  // const [meterTypeOpts, setMeterTypeOpts] = useState();
  // const [meterType, setMeterType] = useState();
  // const [profileName, setProfileName] = useState();
  // const [fromDate, setFromDate] = useState();
  // const [toDate, setToDate] = useState();
  // const [requestType, setRequestType] = useState();
  // const [meterNumber, setMeterNumber] = useState();
  // const [loadingStatus, setLoadingStatus] = useState('');
  // const [rowData, setRowData] = useState();
  // const [searchKey, setSearchKey] = useState();
  // const [colDefs, setColDefs] = useState([
  //   { field: "", filter: true, headerName: "" },
  //   { field: "", filter: true, headerName: "" },
  //   { field: "", filter: true, headerName: "" },
  //   { field: "", filter: true, headerName: "" },
  //   { field: "", filter: true, headerName: "" }
  // ]);

  // //TREESELECT COMPONENT DATA
  // const [office, setOffice] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");

  // const onChangeOffice = (newValue) => {
  //   console.log('onChange ', newValue)
  //   setOffice(newValue)
  // }
  // //SERVICE CALLS
  // const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  // const fetchFormInputs = async () => {
  //   try {
  //     const tokenResponse = await fetch(tokenUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       body: new URLSearchParams({
  //         grant_type: 'password',
  //         username: 'Admin',
  //         password: 'Admin@123',
  //         client_id: 'fooClientId',
  //         client_secret: 'secret',
  //       }),
  //     });

  //     if (!tokenResponse.ok) throw new Error('Failed to authenticate');
  //     const tokenData = await tokenResponse.json();
  //     const accessToken = tokenData.access_token;
  //     const urls = [
  //       `/api/server3/UHES-0.0.1/WS/getmetermake`,
  //       `/api/server3/UHES-0.0.1/WS/getMeterType`,
  //     ];
  //     const [meterManufactureOpts, meterTypeOpts] = await Promise.all(
  //       urls.map((url) =>
  //         fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
  //           .then(response => response.ok ? response.json() : Promise.reject('Fetch failed'))
  //       )
  //     );
  //     setMeterManufactureOpts(meterManufactureOpts.data || []);
  //     setMeterTypeOpts(meterTypeOpts.data || []);
  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // };
  // useEffect(() => {
  //   fetchFormInputs();
  // }, []);
  // const fetchGridData = async () => {
  //   try {
  //     const tokenResponse = await fetch(tokenUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       body: new URLSearchParams({
  //         grant_type: 'password',
  //         username: 'Admin',
  //         password: 'Admin@123',
  //         client_id: 'fooClientId',
  //         client_secret: 'secret',
  //       }),
  //     });

  //     if (!tokenResponse.ok) throw new Error('Failed to authenticate');
  //     const tokenData = await tokenResponse.json();
  //     const accessToken = tokenData.access_token;

  //     const dataResponse = await fetch(
  //       `/api/server3/UHES-0.0.1/WS/callForServerpaginationForMeterReads?createDateEnd=${toDate}&createDateStart=${fromDate}&draw=1&length=10&meterManfacturer=${meterManfacturer}&meterNumber=${meterNumber}&meterType=${meterType}&office=${office}&profileId=${profileName}&requestType=${requestType}&start=0`, {
  //       headers: { 'Authorization': `Bearer ${accessToken}` },
  //     });

  //     if (!dataResponse.ok) throw new Error('Failed to fetch data');
  //     const responseData = await dataResponse.json();
  //     setRowData(responseData.data);
  //     console.log('fetched service data:', (responseData.data));

  //   } catch (err) {
  //     setLoadingStatus('Data not found');
  //     console.error(err.message);
  //   }
  // };
  // const exportCSV = () => {
  //   const csvData = rowData.map(row => ({
  //     AlarmName: row.ALARAMNAME,
  //     MeterNumber: row.METERNO,
  //     AlarmTime: row.ALARAMTIME,
  //     HESTime: row.RESPONSETIME
  //   }));

  //   const csvContent = [
  //     Object.keys(csvData[0]).join(','),
  //     ...csvData.map(row => Object.values(row).join(','))
  //   ].join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(blob);
  //   link.setAttribute('download', 'Alarms.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const exportExcel = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Alarms Data');
  //   const headers = Object.keys(rowData[0] || {});
  //   const title = worksheet.addRow([`Alarms`]);
  //   title.font = { bold: true, size: 16, color: { argb: 'FFFF00' } };
  //   title.alignment = { horizontal: 'center' };
  //   worksheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);

  //   const headerRow = worksheet.addRow(headers);

  //   headerRow.eachCell((cell) => {
  //     cell.font = { bold: true, color: { argb: 'FFFFFF' } };
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFADD8E6' },
  //     };
  //   });

  //   rowData.forEach(row => {
  //     worksheet.addRow(Object.values(row));
  //   });

  //   worksheet.autoFilter = {
  //     from: 'A2',
  //     to: `${String.fromCharCode(64 + headers.length)}2`
  //   };

  //   headers.forEach((header, index) => {
  //     const maxLength = Math.max(
  //       header.length,
  //       ...rowData.map(row => row[header] ? row[header].toString().length : 0)
  //     );
  //     worksheet.getColumn(index + 1).width = maxLength + 2;
  //   });

  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   saveAs(blob, `Alarms.xlsx`);
  // };

  // const exportPDF = () => {
  //   const doc = new jsPDF();
  //   const tableColumn = ["Alarm Name", "Meter Number", "Alarm Time", "HES Time"];
  //   const tableRows = [];

  //   rowData.forEach(row => {
  //     tableRows.push([row.ALARAMNAME, row.METERNO, row.ALARAMTIME, row.RESPONSETIME]);
  //   });

  //   doc.autoTable(tableColumn, tableRows);
  //   doc.save('Alarms.pdf');
  // };

  // const searchData = (e) => {
  //   const searchValue = e.target.value;
  //   setSearchKey(searchValue);
  //   if (searchValue === "") {
  //     setRowData(rowData);
  //   } else {
  //     const filteredData = rowData.filter((row) =>
  //       Object.values(row).some((val) =>
  //         String(val).toLowerCase().includes(searchValue.toLowerCase())
  //       )
  //     );
  //     setRowData(filteredData);
  //   }
  // };
  return (
    <Fragment>
      {/* <Container fluid>
        <Form>
          <Row className="m-1">
            <Col xs={12} md={4}>
              <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office}/>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Meter Manufacture</Form.Label>
                <Form.Control as="select" value={meterManfacturer} onChange={(e) => setMeterManufacturer(e.target.value)} required>
                  <option value="">-NA-</option>
                  {meterManufactureOpts.map((manfOpt, index) => (
                    <option key={index} value={manfOpt.make_name}>
                      {manfOpt.make}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-center">*</span>Meter Type</Form.Label>
                <Form.Control as="select" value={meterType} onChange={(e) => setMeterType(e.target.value)} required>
                  <option value="">-NA-</option>
                  {meterTypeOpts.map((mtype, index) => (
                    <option key={index} value={mtype.type}>{mtype.type}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Profile Name</Form.Label>
                <Form.Control as="select" value={profileName} onChange={(e) => setProfileName(e.target.value)} required>
                  <option value="Instantaneous Data">Instantaneous Data</option>
                  <option value="Block Load Profile">Block Load Profile</option>
                  <option value="Daily LoadProfile">Daily LoadProfile</option>
                  <option value="Monthly Billing">Monthly Billing</option>
                  <option value="Other Events">Other Events</option>
                  <option value="Non Rollover Events">Non Rollover Events</option>
                  <option value="Voltage Events">Voltage Events</option>
                  <option value="Power Failure Details">Power Failure Details</option>
                  <option value="Control Events">Control Events</option>
                  <option value="Current Events">Current Events</option>
                  <option value="Transaction Events">Transaction Events</option>
                  <option value="Name Plate">Name Plate</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>From Date</Form.Label>
                <Form.Control type="datetime-local" value={fromDate} onChange={(e) => setFromDate((e.target.value).replace('T', ' '))} required />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>To Date</Form.Label>
                <Form.Control type="datetime-local" value={toDate} onChange={(e) => setToDate((e.target.value).replace('T', ' '))} required />
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Request Type</Form.Label>
                <Form.Control as="select" value={requestType} onChange={(e) => setRequestType(e.target.value)} required>
                  <option value="" >-NA-</option>
                  <option value="ALL">All</option>
                  <option value="O">On Demand</option>
                  <option value="S">Scheduler</option>
                  <option value="SP">Scheduler PUSH</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>Meter Number</Form.Label>
                <Form.Control type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} className='text-center'>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  fetchGridData();
                  setLoadingStatus('Data Loading');
                }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>Submit</Button>
            </Col>
          </Row>
        </Form>
      </Container>
      {rowData ? (
        <Container fluid>
          <Row className="mt-4">
            <Col xs={12} md={6} className="d-flex flex-wrap mb-3">
              <Button variant="primary" size="md" className="m-1" onClick={exportExcel} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                Excel
              </Button>
              <Button variant="primary" size="md" className="m-1" onClick={exportPDF} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                PDF
              </Button>
              <Button variant="primary" size="md" className="m-1" onClick={exportCSV} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>
                CSV
              </Button>
            </Col>
            <Col xs={12} md={4} className="ms-auto">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search"
                  value={searchKey}
                  onChange={searchData}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mx-auto">
              <div
                className="ag-theme-quartz"
                style={{ height: 350, width: "100%" }}
              >
                <AgGridReact
                  rowData={rowData}
                  columnDefs={colDefs}
                  pagination={true}
                  paginationPageSize={5}
                  paginationPageSizeSelector={[5, 10, 15, 20]}
                />
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <Row>
          <Col md={10} className="text-center text-danger mx-auto m-2">
            {loadingStatus}
          </Col>
        </Row>
      )} */}
    </Fragment>
  );
}

export default ReLoadMeterReads