import { Fragment, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { TrashFill, Download, Search } from "react-bootstrap-icons";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import CryptoJS from 'crypto-js';
import {Link} from 'react-router-dom';

const EventMaster = () => {
  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey(prevKey => prevKey + 1);
  };
  const encryptData = (data) => {
    const encrypted = CryptoJS.AES.encrypt(data, 'event-skey').toString();
    return encodeURIComponent(encrypted);
  };
  const EventNameLinkRender = ({ value, id }) => {
    const encryptedEventCode = encryptData(id);
    const encryptedEventName = encryptData(value);
    
    return (
      <Link to={`/eventmasterupdate/${encryptedEventName}/${encryptedEventCode}`} style={{ color: 'blue' }}>
        {value}
      </Link>
    );
  }
  const ReLoadCmp = () => {
    const [eventData, setEventData] = useState();
    const [loadingStatus, setLoadingStatus] = useState('Data Loading');
    const [eventColDefs, setEventColDefs] = useState([
      { headerName: "", field: "checkbox", checkboxSelection: true, flex: 2, width: 100 },
      { headerName: "Event Short Code", field: "evenCode", flex: 4, filter: true },
      {
        headerName: "Event Name", field: "evenName", flex: 4, filter: true,
        cellRenderer: (params) => {
          return (
            <EventNameLinkRender value={params.value} id={params.data?.id} />
          );
        }
      },
      {
        headerName: "",
        field: "actions",
        cellRenderer: (params) => {
          return (
            <span
              style={{ cursor: "pointer" }}
              title="Delete Row"
            >
              <TrashFill color="red" size="20" />
            </span>
          );
        },
        flex: 2
      }
    ]);
    const [evCodeKey, setEvCodeKey] = useState();
    const [evNameKey, setEvNameKey] = useState();
    //SERVICE CALL
    const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
    const fetchEventGridData = async () => {
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

        const dataResponse = await fetch('/api/server3/UHES-0.0.1/WS/getAllFepEventMaster', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!dataResponse.ok) throw new Error('Failed to fetch data');
        const responseData = await dataResponse.json();
        setEventData(responseData.data);
        console.log('fetched service data:', (responseData.data));

      } catch (err) {
        setLoadingStatus('Data not found');
        console.error(err.message);
      }
    };
    useEffect(() => {
      fetchEventGridData();
    }, []);

    const exportCSV = () => {
      const csvData = eventData.map(row => ({
        EventShortCode: row.evenCode,
        EventName: row.evenName,
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'EventMaster.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const exportExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Event Master Data');
      const headers = Object.keys(eventData[0] || {});
      const title = worksheet.addRow([`Event Master Data`]);
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

      eventData.forEach(row => {
        worksheet.addRow(Object.values(row));
      });

      worksheet.autoFilter = {
        from: 'A2',
        to: `${String.fromCharCode(64 + headers.length)}2`
      };

      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...eventData.map(row => row[header] ? row[header].toString().length : 0)
        );
        worksheet.getColumn(index + 1).width = maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `EventMaster.xlsx`);
    };

    const exportPDF = () => {
      const doc = new jsPDF();
      const tableColumn = ["Event Short Code", "Event Name"];
      const tableRows = [];

      eventData.forEach(row => {
        tableRows.push([row.evenCode, row.evenName]);
      });

      doc.autoTable(tableColumn, tableRows);
      doc.save('EventMaster.pdf');
    };
    const exportXML = () => {
      alert('xml');
    }
    const searchData = () => {
      if (evCodeKey === "" && evNameKey === "") {
        setEventData(eventData);
      } else {
        const filteredData = eventData.filter((row) =>
          Object.values(row).some((val) =>
            String(val).includes(evCodeKey) ||
            String(val).includes(evNameKey)
          )
        );
        setEventData(filteredData);
      }
    }
    return (
      <Fragment>
        {
          eventData ? (
            <Container fluid>
              <Row>
                <Col xs={10} lg={6} className="d-flex justify-content-start">
                  <Form.Group>
                    <Form.Control type="text" placeholder='eventcode' value={evCodeKey} onChange={(e) => setEvCodeKey(e.target.value)} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control type="text" placeholder="eventname" value={evNameKey} onChange={(e) => setEvNameKey(e.target.value)} />
                  </Form.Group>
                  <Search color="blue" size="15" onClick={searchData} />
                </Col>
              </Row>
              <Row>
                <Col xs={12} className="mx-auto">
                  <div
                    className="ag-theme-quartz"
                    style={{ height: 350, width: "100%" }}
                  >
                    <AgGridReact
                      rowData={eventData}
                      columnDefs={eventColDefs}
                      pagination={true}
                      paginationPageSize={5}
                      paginationPageSizeSelector={[5, 10, 15, 20]}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={12} className="d-flex justify-content-end mt-2">
                  <span><Download color="black" size="10" /></span>
                  <span className="text-primary" onClick={exportCSV}>CSV</span> |
                  <span className="text-primary" onClick={exportExcel}>Excel</span> |
                  <span className="text-primary" onClick={exportXML}>XML</span> |
                  <span className="text-primary" onClick={exportPDF}>PDF</span>
                </Col>
              </Row>
              <Row className="m-1">
                <Col xs={10} lg={4}>
                  <Button variant="primary" size="md">NEW</Button>
                </Col>
              </Row>
            </Container>
          ) :
            (
              <Row>
                <Col md={10} className="text-center text-danger mx-auto m-2 fs-5">
                  {loadingStatus}
                </Col>
              </Row>
            )
        }
      </Fragment>
    );
  }
  return (
    <Fragment>
      <Row>
        <div style={{ direction: 'rtl' }} >
          <FontAwesomeIcon icon={faRotateRight} onClick={reloadComponent} style={{ color: "#070b12", cursor: 'pointer', fontSize: '19px', marginLefta: '15px' }} />
        </div>
      </Row>
      <ReLoadCmp key={key} />
    </Fragment>
  )
}

export default EventMaster;