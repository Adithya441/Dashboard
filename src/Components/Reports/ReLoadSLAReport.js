import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { Container, Row, Col, Form, Button, InputGroup} from 'react-bootstrap';
import { Fragment, useState } from 'react';
import TreeSelectCmp from '../TreeDropdown/TreeSelect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReLoadSLAReport = () => {
  const [reportType, setReportType] = useState();
  const [monthInput, setMonthInput] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [loadingStatus, setLoadingStatus] = useState();
  const [gridData, setGridData] = useState();
  const [searchKey, setSearchKey] = useState();
  const [colDefs, setColDefs] = useState([])

  const [office, setOffice] = useState("3459274e-f20f-4df8-a960-b10c5c228d3e");

  const onChangeOffice = (newValue) => {
    console.log('onChange ', newValue)
    setOffice(newValue);
  }
  //SERVICE CALL
  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const fetchGridData = async (gridLink) => {
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

      const dataResponse = await fetch(gridLink, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) throw new Error('Failed to fetch data');
      const responseData = await dataResponse.json();
      setGridData(responseData.data);
      if(reportType==='MONTH'){
        setColDefs([
          {field:'PROFILE_NAME',headerName:'PROFILENAME',filter:true},
          {field:'SLA_TIME',headerName:'SLATIME',filter:true},
          {field:'REQUEST_DATE',headerName:'SLAMONTH',filter:true},
          {field:'SLA_REQUEST',headerName:'SLAREQUEST',filter:true},
          {field:'TOTAL_METERS',headerName:'TOTALCOUNT',filter:true},
          {field:'SUCCESS_METERS',headerName:'SUCCESSCOUNT',filter:true},
          {field:'FIXED_SLA',headerName:'TARGETSLA(%)',filter:true},
          {field:'SLA_Achieved',headerName:'ACHIEVEDSLA(%)',filter:true}
        ])
      }
      else if(reportType==='DAY'){
        setColDefs([
          {field:'PROFILE_NAME',headerName:'PROFILENAME',filter:true},
          {field:'SLA_TIME',headerName:'SLA_TIME',filter:true},
          {field:'REQUEST_DATE',headerName:'REQUESTDATE',filter:true},
          {field:'SLA_REQUEST',headerName:'SLAREQUEST',filter:true},
          {field:'TOTAL_METERS',headerName:'TOTALCOUNT',filter:true},
          {field:'SUCCESS_METERS',headerName:'SUCCESSCOUNT',filter:true},
          {field:'FIXED_SLA',headerName:'TARGETSLA(%)',filter:true},
          {field:'SLA_Achieved',headerName:'ACHIEVEDSLA(%)',filter:true}
        ])
      }
      if ((responseData.data).length == 0) {
        setLoadingStatus('Data Not Found');
      }
      console.log('fetched service data:', (responseData.data));

    } catch (err) {
      console.error(err.message);
    }
  };
  const exportCSV = () => {
    const csvData=[];
    if(reportType==='MONTH'){
      csvData = gridData.map(row => ({
        PROFILENAME:row.PROFILE_NAME,
        SLATIME:row.SLA_TIME,
        SLAMONTH:row.REQUEST_DATE,
        SLAREQUEST:row.SLA_REQUEST,
        TOTALCOUNT:row.TOTAL_METERS,
        SUCCESSCOUNT:row.SUCCESS_METERS,
        TARGETSLA_PER:row.FIXED_SLA,
        ACHIEVEDSLA_PER:row.SLA_Achieved
      }));
    }
    else if(reportType==='DAY'){
    csvData = gridData.map(row => ({
      PROFILENAME:row.PROFILE_NAME,
        SLATIME:row.SLA_TIME,
        REQUESTDATE:row.REQUEST_DATE,
        SLAREQUEST:row.SLA_REQUEST,
        TOTALCOUNT:row.TOTAL_METERS,
        SUCCESSCOUNT:row.SUCCESS_METERS,
        TARGETSLA_PER:row.FIXED_SLA,
        ACHIEVEDSLA_PER:row.SLA_Achieved
      }));
    }

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'SLAREPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SLA REPORT');
    const headers = Object.keys(gridData[0] || {});
    const title = worksheet.addRow([`SLA REPORT`]);
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
    saveAs(blob, `SLAREPORT.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [];
    const tableRows = [];

    if(reportType==='MONTH'){
      tableColumn=["PROFILENAME","SLATIME","SLAMONTH","SLAREQUEST","TOTALCOUNT","SUCCESSCOUNT","TARGETSLA_PER","ACHIEVEDSLA_PER"];
      gridData.forEach(row => {
        tableRows.push([row.PROFILE_NAME, row.SLA_TIME, row.REQUEST_DATE, row.SLA_REQUEST,row.TOTAL_METERS,row.SUCCESS_METERS,row.FIXED_SLA,row.SLA_Achieved]);
      });
    }
    else if(reportType==='DAY'){
      tableColumn=["PROFILENAME","SLATIME","REQUESTDATE","SLAREQUEST","TOTALCOUNT","SUCCESSCOUNT","TARGETSLA_PER","ACHIEVEDSLA_PER"];
      gridData.forEach(row => {
        tableRows.push([row.PROFILE_NAME, row.SLA_TIME, row.REQUEST_DATE, row.SLA_REQUEST,row.TOTAL_METERS,row.SUCCESS_METERS,row.FIXED_SLA,row.SLA_Achieved]);
      });
    }
    doc.autoTable(tableColumn, tableRows);
    doc.save('SLAREPORT.pdf');
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
  const copyData =()=>{
    const textData = gridData.map(row =>
      `${row.PROFILE_NAME}\t${row.SLA_TIME}\t${row.REQUEST_DATE}\t${row.SLA_REQUEST}\t${row.TOTAL_METERS}\t${row.SUCCESS_METERS}\t${row.FIXED_SLA}\t${row.SLA_Achieved}`
    )
      .join("\n");
    navigator.clipboard.writeText(textData)
      .then(() => alert("Data copied to clipboard!"))
      .catch((error) => alert("Failed to copy data: " + error));
  }
  //FUNCTION TO HANDLE MONTH INPUT
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const handleMonthInput = (dValue) => {
    const cdate = new Date(dValue);
    const cmonth = months[cdate.getMonth()];
    const cyear = cdate.getFullYear();
    const cmonthInp = `${cmonth}-${cyear}`;
    console.log('month input value:', cmonthInp);
    setMonthInput(cmonthInp);
  }

  return (
    <Fragment>
      <Container fluid>
        <Form>
          <Row className="m-1">
            <Col xs={10} md={4}>
              <TreeSelectCmp onChangeOffice={onChangeOffice} officeId={office} />
            </Col>
            <Col xs={10} md={4}>
              <Form.Group>
                <Form.Label><span className="text-danger">*</span>Report Type</Form.Label>
                <Form.Control as="select" value={reportType}
                  onChange={(e) => setReportType(e.target.value)}>
                  <option value="">-NA-</option>
                  <option value="MONTH">Monthly SLA</option>
                  <option value="DAY">Daily Wise SLA</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          {(reportType === "MONTH") && (
            <Row className="m-1">
              <Col xs={10} md={4} style={{width:'100%', display:'block'}}>
                <div className="form-group">
                  <p className="form-label">
                    <span className="text-danger">*</span> Month
                  </p>
                  <DatePicker
                    selected={monthInput}
                    onChange={(date) => handleMonthInput(date)}
                    dateFormat="MMM-yyyy"
                    className="form-control"
                  />
                </div>
              </Col>
            </Row>
          )}
          {
            (reportType === "DAY") && (
              <Row className="m-1">
                <Col xs={10} md={6}>
                  <Form.Group>
                    <Form.Label><span className="text-danger">*</span>From Date</Form.Label>
                    <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={10} md={6}>
                  <Form.Group>
                    <Form.Label><span className='text-danger'>*</span>To Date</Form.Label>
                    <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            )
          }
          <Row className="m-1">
            <Col xs={12} className="text-center mx-auto">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setLoadingStatus('Loading Data');
                  if (reportType === "MONTH") {
                    fetchGridData(`/api/server3/UHES-0.0.1/WS/getSlaReportOnMonthBasis?Month=${monthInput}&officeid=${office}`);
                  }
                  else if (reportType === "DAY") {
                    fetchGridData(`/api/server3/UHES-0.0.1/WS/getSlaReportOnDayBasis?fromDate=${fromDate}&officeid=${office}&toDate=${toDate}`);
                  }
                }}
                style={{ backgroundColor: '#5cb0e7', borderColor: '#5cb0e7' }}
              >Submit</Button>
            </Col>
          </Row>
        </Form>
        {
          gridData ? (
            <Container fluid>
              <Row className="mt-4">
                <Col xs={12} md={6} className="d-flex flex-wrap gap-1 mb-3">
                  <Button size="md" onClick={exportExcel} style={{ backgroundColor: '#5cb0e7', borderColor: '#5cb0e7' }}>
                    Excel
                  </Button>
                  <Button size="md" onClick={exportPDF} style={{ backgroundColor: '#5cb0e7', borderColor: '#5cb0e7' }}>
                    PDF
                  </Button>
                  <Button size="md" onClick={exportCSV} style={{ backgroundColor: '#5cb0e7', borderColor: '#5cb0e7' }}>
                    CSV
                  </Button>
                  <Button size="md" onClick={copyData} style={{ backgroundColor: '#5cb0e7', borderColor: '#5cb0e7' }}>
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

export default ReLoadSLAReport;