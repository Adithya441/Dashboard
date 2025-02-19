import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Fragment, useState } from 'react';

const ReLoadCMRITransactionReport = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [loadingStatus, setLoadingStatus] = useState();
  const [searchKey, setSearchKey] = useState();
  const [gridData, setGridData] = useState();
  const [colDefs, setColDefs] = useState([
    { field: 'TRANSACTION_ID', headerName: 'Transaction Id', filter: true },
    { field: 'FILE_NAME', headerName: 'File Name', filter: true },
    { field: 'METER_NUMBER', headerName: 'Meter Number', filter: true },
    { field: 'HES_UPLOAD_DATE', headerName: 'HES Upload Date', filter: true },
    { field: 'SOURCE_TYPE', headerName: 'Source Type', filter: true },
    { field: 'STATUS', headerName: 'Status', filter: true },
    { field: 'MESSAGE', headerName: 'Message', filter: true }
  ]);
  //SERVICE CALL
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
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

      const dataResponse = await fetch(`/api/server3/UHES-0.0.1/WS/getCMRITransactionReport?fromDate=${fromDate}&toDate=${toDate}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setGridData(responseData.data);
      if ((responseData.data).length == 0) {
        setLoadingStatus('Data Not Found');
      }
      console.log('fetched service data:', (responseData.data));

    } catch (err) {
      console.error(err.message);
    }
  };
  const exportCSV = () => {
    const csvData = gridData.map(row => ({
      TRANSACTIONID: row.TRANSACTION_ID,
      FILENAME: row.FILE_NAME,
      METERNUMBER: row.METER_NUMBER,
      HESUPLOADDATE: row.HES_UPLOAD_DATE,
      SOURCETYPE: row.SOURCE_TYPE,
      STATUS: row.STATUS,
      MESSAGE: row.MESSAGE
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'CMRITRANSACTIONREPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CMRI TRANSACTION REPORT');
    const headers = Object.keys(gridData[0] || {});
    const title = worksheet.addRow([`CMRI TRANSACTION REPORT`]);
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

    gridData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.autoFilter = {
      from: 'A2',
      to: `${String.fromCharCode(64 + headers.length)}2`
    };

    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...gridData.map(row => row[header] ? row[header].toString().length : 0)
      );
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `CMRITRANSACTIONREPORT.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["TRANSACTIONID", "FILENAME", "METERNUMBER", "HESUPLOADDATE", "SOURCETYPE", "STATUS", "MESSAGE"];
    const tableRows = [];

    gridData.forEach(row => {
      tableRows.push([row.TRANSACTION_ID, row.FILE_NAME, row.METER_NUMBER, row.HES_UPLOAD_DATE, row.SOURCE_TYPE, row.STATUS, row.MESSAGE]);
    });

    doc.autoTable(tableColumn, tableRows);
    doc.save('CMRITRANSACTIONREPORT.pdf');
  };

  const copyData = () => {
    const textData = gridData.map(row =>
      `${row.TRANSACTION_ID}\t${row.FILE_NAME}\t${row.METER_NUMBER}\t${row.HES_UPLOAD_DATE}\t${row.SOURCE_TYPE}\t${row.STATUS}\t${row.MESSAGE}`
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
      setGridData(gridData);
    } else {
      const filteredData = gridData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setGridData(filteredData);
    }
  };
  return (
    <Fragment>
      <Container fluid>
        <Form>
          <Row className='m-1'>
            <Col xs={10} lg={6} >
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>From Date</Form.Label>
                <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col xs={10} lg={6} >
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>To Date</Form.Label>
                <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="m-1">
            <Col xs={12} className="text-center mx-auto">
              <Button onClick={
                (e) => {
                  e.preventDefault();
                  setLoadingStatus('Loading Data');
                  fetchGridData();
                }
              }>Submit</Button>
            </Col>
          </Row>
        </Form>
        {
          gridData ? (
            <Container fluid>
              <Row className="mt-4">
                <Col xs={12} md={6} className="d-flex flex-wrap gap-1 mb-3">
                  <Button variant="primary" size="md" onClick={exportExcel}>
                    Excel
                  </Button>
                  <Button variant="primary" size="md" onClick={exportPDF}>
                    PDF
                  </Button>
                  <Button variant="primary" size="md" onClick={exportCSV}>
                    CSV
                  </Button>
                  <Button variant="primary" size="md" onClick={copyData}>
                    Copy
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
                      rowData={gridData}
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
          )
        }
      </Container>
    </Fragment>
  );
}

export default ReLoadCMRITransactionReport;