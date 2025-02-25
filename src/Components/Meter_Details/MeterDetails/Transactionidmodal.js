import React, { useState, useEffect, useCallback } from 'react';
import DynamicTable from './DynamicTable.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import loadingGif from '../../../Assets/img2.gif';
import { Col, Row } from 'react-bootstrap';
import '../../Reports/styless.css'

const Transactionidmodal = ({ transactionId, meterman, meterty, meternum }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportFormat, setExportFormat] = useState('');

    const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';

    const fetchData = useCallback(async () => {
        setError(null);
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

            const baseUrl = `/api/server3/UHES-0.0.1/WS/getResponseDataByTransactionId?metermanufacture=${meterman}&metertype=${meterty}&transactionId=${transactionId}`;
            const dataResponse = await fetch(baseUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!dataResponse.ok) throw new Error('Failed to fetch data');
            const responseData = await dataResponse.json();
            setData(responseData.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [meterman, meterty, transactionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Export CSV
    const exportToCSV = () => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const csvContent = [
            Object.keys(data[0]).join(','), // Headers
            ...data.map(row => Object.values(row).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${transactionId}.csv`);
    };

    // Export Excel
    const exportToExcel = async () => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const headers = Object.keys(data[0]);

        const title = worksheet.addRow([`${transactionId}`]);
        title.font = { bold: true, size: 16, color: { argb: 'FFFF00' } };
        title.alignment = { horizontal: 'center' };
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + headers.length - 1)}1`);

        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFADD8E6' },
            };
        });

        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });

        worksheet.autoFilter = `A2:${String.fromCharCode(65 + headers.length - 1)}2`;

        headers.forEach((header, index) => {
            const maxLength = Math.max(
                header.length,
                ...data.map(row => row[header] ? row[header].toString().length : 0)
            );
            worksheet.getColumn(index + 1).width = maxLength + 2;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${transactionId}.xlsx`);
    };

    // Export PDF
    const exportToPDF = () => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const doc = new jsPDF();
        const tableColumn = Object.keys(data[0]);
        const tableRows = data.map(row => tableColumn.map(col => row[col] || ''));

        doc.text(`Transaction ID: ${transactionId}`, 10, 10);
        doc.autoTable({ head: [tableColumn], body: tableRows });

        doc.save(`${transactionId}.pdf`);
    };

    // Handle export
    const handleExport = (value) => {
        switch (value) {
            case 'csv':
                exportToCSV();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'pdf':
                exportToPDF();
                break;
            default:
                break;
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <Row>
                <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: 'calc(100% - 40px)', 
                    maxWidth: '100%', 
                    padding: '10px',
                    boxSizing: 'border-box',
                    marginLeft: '12px'
                }} 
                className="form-title"
                >
                <h5 style={{ margin: 0 }}>Meter Parameter Details</h5>
                </div>
            </Row>
            <Row>
                <Col>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="meternum">Meter Number:</label>
                <input
                    type="text"
                    id="meternum"
                    value={meternum || ""}
                    readOnly
                    style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                />
            </div>
            </Col>
            <Col>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="transactionId">Transaction ID:</label>
                <input
                    type="text"
                    id="transactionId"
                    value={transactionId || ""}
                    readOnly
                    style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                />
            </div>
            </Col>
            </Row>

            <div>
                <label htmlFor="export-format">Export:</label>
                <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => handleExport(e.target.value)}
                    style={{ height: '30px', marginLeft: '10px' }}
                >
                    <option value="">Select Format</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                </select>
            </div>


            {loading ? (
                <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: '150px', margin: '50px 350px' }} />
            ) : (
                <div className="ag-theme-alpine" style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                    <DynamicTable data={data} />
                </div>
            )}
        </div>
    );
};

export default Transactionidmodal;