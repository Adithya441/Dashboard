import { Fragment } from "react";
import { Row, Col, Form, Button, Container, InputGroup } from "react-bootstrap";
import {  useState } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Modal } from "react-bootstrap";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import {CheckCircle} from 'react-bootstrap-icons';

const ReLoadMeterPing = () => {
  const [meterNumber, setMeterNumber] = useState();
  const [pingData, setPingData] = useState();
  const [pingLoadingStatus, setPingLoadingStatus] = useState('');
  const [transData, setTransData] = useState();
  const [transLoadingStatus, setTransLoadingStatus] = useState('');
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [showModal, setShowModal] = useState(false);
  const [transId, setTransId] = useState();
  const [searchKey, setSearchKey] = useState();
  const [pingColDefs, setPingColDefs] = useState([
    { field: "METER_NO", headerName: "Meter No", flex: 2 },
    { field: "IP_ADDRESS", headerName: "IPV4", flex: 4 },
    { field: "SIM", headerName: "Sim No", flex: 2 },
    { field: "METER_PROTOCOL", headerName: "Command", flex: 2 },
    { field: "RELAY_STATUS", headerName: "Relay Status", flex: 2 }
  ]);
  const [transhistColDefs, setTransHistColDefs] = useState([
    { field: "meterNumber", headerName: "Meter Number", filter: true, flex: 2 },
    { field: "transactionId", headerName: "Transaction ID", filter: true, flex: 2 },
    { field: "requestType", headerName: "Request Type", filter: true },
    { field: "requestTime", headerName: "Request Time", filter: true },
    { field: "responseTime", headerName: "Response Time", filter: true },
    { field: "responseCode", headerName: "Response Code", filter: true }
  ])
  //SERVICE CALLS
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';

  const fetchMeterPingStatusGridData = async () => {
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

      const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/getPingmeter?meterno=${meterNumber}&officeId=3459274e-f20f-4df8-a960-b10c5c228d3e`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setPingData(Array(responseData.data[0]));
      console.log('fetched service data:', (Array(responseData.data[0])));

    } catch (err) {
      setPingLoadingStatus('Data not found');
      console.error(err.message);
    }
  }
  const sendPingRequest = async () => {
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

      const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/fepondemandrequest`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            {
              "commandType": "PING",
              "fromdate": "null",
              "meterno": `${meterNumber}`,
              "todate": "null",
              "userid": "null"
            }
          )
        });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setTransId((responseData.data[0]).transactionId);
      setShowModal(true);
      console.log('fetched ping request id:', ((responseData.data[0]).transactionId));

    } catch (err) {
      setTransLoadingStatus('Data not found');
      console.error(err.message);
    }
  }
  const fetchTransHistData = async () => {
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

      const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/getdataByMeterNumberForPing?fromDate=${fromDate}&meterNumber=${meterNumber}&requestType=PING&toDate=${toDate}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setTransData(responseData.data);
      console.log('fetched service data:', (responseData.data));

    } catch (err) {
      setTransLoadingStatus('Data not found');
      console.error(err.message);
    }
  }
  const exportCSV = () => {
    const csvData = transData.map(row => ({
      MeterNumber: row.meterNumber,
      TransactionID: row.transactionId,
      RequestType: row.requestType,
      RequestTime: row.requestTime,
      ResponseTime: row.responseTime,
      ResponseCode: row.responseCode
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'MeterPing.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Meter Ping');
    const headers = Object.keys(transData[0] || {});
    const title = worksheet.addRow([`Meter Ping`]);
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

    transData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.autoFilter = {
      from: 'A2',
      to: `${String.fromCharCode(64 + headers.length)}2`
    };

    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...transData.map(row => row[header] ? row[header].toString().length : 0)
      );
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `MeterPing.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Meter Number","Transaction ID","Request Type","Request Time","Response Time","Response Code"];
    const tableRows = [];

    transData.forEach(row => {
      tableRows.push([row.meterNumber, row.transactionId, row.requestType, row.requestTime, row.responseTime, row.responseCode]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('MeterPing.pdf');
  };

  const searchData = (e) => {
    const searchValue = e.target.value;
    setSearchKey(searchValue);
    if (searchValue === "") {
      setTransData(transData);
    } else {
      const filteredData = transData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setTransData(filteredData);
    }
  };
  const ModalCmp = ({ transId, onclose }) => {
    return (
      <Modal onHide={onclose} show={showModal} centered size="lg">
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
          <CheckCircle color="green" size={15} />
          </div>
          <br />
          <h6 className="text-primary">Request Successfully With: {transId}</h6>
        </Modal.Body>
        <Modal.Footer>
          <Button  onClick={onclose} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return (
    <Fragment>
      <Container fluid>
        <Form>
          <Row className="m-1">
            <Col xs={10} lg={6}>
              <Form.Group>
                <Form.Label>Meter No</Form.Label>
                <Form.Control type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} className="text-center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setPingLoadingStatus('Loading Data');
                  fetchMeterPingStatusGridData();
                }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}
              >Search</Button>
            </Col>
          </Row>
        </Form>
        {pingData ? (
          <Row>
            <Col xs={12} className="mx-auto">
              <div
                className="ag-theme-quartz"
                style={{ height: 300, width: "100%" }}
              >
                <AgGridReact
                  rowData={pingData}
                  columnDefs={pingColDefs}
                  pagination={true}
                  paginationPageSize={5}
                  paginationPageSizeSelector={[5, 10, 15, 20]}
                />
              </div>
            </Col> <br />
            <Row className="m-1">
              <Col xs={12} className="text-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    sendPingRequest();
                  }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>Send Request</Button>
              </Col>
            </Row>
          </Row>
        ) : (
          <Row>
            <Col md={10} className="text-center text-danger mx-auto m-2">
              {pingLoadingStatus}
            </Col>
          </Row>
        )}
      </Container>
      <br />
      {pingData && (
        <Container fluid>
          <Form>
            <h3 className="form-title">Transaction History Grid</h3>
            <Row className="m-1">
              <Col xs={10} lg={6}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control type="datetime-local" value={fromDate} onChange={(e) => setFromDate((e.target.value).replace('T', ' '))} />
                </Form.Group>
              </Col>
              <Col xs={10} lg={6}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control type="datetime-local" value={toDate} onChange={(e) => setToDate((e.target.value).replace('T', ' '))} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="m-1">
              <Col xs={12} className="text-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setTransLoadingStatus('Data Loading');
                    fetchTransHistData();
                  }} style={{backgroundColor:'#5cb0e7',borderColor:'#5cb0e7'}}>Submit</Button>
              </Col>
            </Row>
          </Form>
        </Container>
      )}
      {(pingData && transData) ? (
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
                  rowData={transData}
                  columnDefs={transhistColDefs}
                  pagination={true}
                  paginationPageSize={5}
                  paginationPageSizeSelector={[5, 10, 15, 20]}
                />
              </div>
            </Col> <br />
          </Row>
        </Container>
      ) : (
        <Row>
          <Col md={10} className="text-center text-danger mx-auto m-2">
            {transLoadingStatus}
          </Col>
        </Row>
      )}
      {(showModal) && (
        <ModalCmp onclose={() => setShowModal(false)} transId={transId} />
      )}
    </Fragment>
  )
}

export default ReLoadMeterPing