import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import GetNotCommunicated from './GetNotCommunicated';
import { Modal, Button } from 'react-bootstrap';
import './NonCommunicatedMeters.css'

const NonCommunicatedMeters = ({officeid}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataavailable, setDataAvailable] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectlabel,setSelectLabel] = useState(null);

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getmeterCommunicationStatus?officeid=${officeid}`;

  const fetchData = async () => {
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'Admin',
          password: 'Admin@123',
          client_id: 'fooClientId',
          client_secret: 'secret',
        }),
      });

      if (!tokenResponse.ok) return <p>No Data available</p>

      const { access_token: accessToken } = await tokenResponse.json();
      const dataResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!dataResponse.ok) return <p>No Data available</p>

      const responseData = await dataResponse.json();
      if (
        !responseData || !responseData.yData || !responseData.xData
      ) {
        setLoading(false);
        setDataAvailable("No Data Available");
        return;
      }
      
      // Directly set xData and yData for chart rendering
      const labels = responseData.xData;
      const series = responseData.yData;

      setChartData({ labels, series });
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Reset loading state when officeid changes
    fetchData();
  }, [officeid]);

  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false, // Show the toolbar
        tools: {
            download: true,
        },
        export: {
            csv: {
                filename: `Not Communicated Meters`,
            },
            svg: {
                filename: `Not Communicated Meters`
            },
            png: {
                filename: `Not Communicated Meters`
            }
        },
    },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedLabel = chartData.labels[config.dataPointIndex];
          const selectedValue = chartData.series[0].data[config.dataPointIndex];
          setSelectedData({ label: selectedLabel, value: selectedValue });
          setShowModal(true);
          setSelectLabel(selectedLabel);
        },
      },
    },
    xaxis: {
      categories: chartData ? chartData.labels : [],
    },
    colors: ['#619ED6'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        dataLabels: {
          position: 'top', // Position the labels on top of the bars
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      style: {
        fontSize: '12px', // Customize label font size
        colors: ['#000'], // Customize label color
      },
      offsetY: -15,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Meters`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    legend: {
      position: 'bottom',
    },
  };

  const handleClose = () => setShowModal(false);

  return (
    <div className='blck3'>
      <h5 className='chart-name'>Non Communicated Meters</h5>
      {loading ? (
        <div>Loading...</div>
      ) : dataavailable ? (
        <div className="no-data-available">{dataavailable}</div>
      ) : chartData ? (
        <div className="charts3">
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="bar"
            width="100%"
            height="100%"
          />
        </div>
      ) : (
        <div>No Data Available</div>
      )}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1050,
            backgroundColor: '#fff',
            width: '70vw',
            borderRadius: '5px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            padding: '1em',
            marginLeft: '10vw',
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 id="contained-modal-title-vcenter">{selectlabel}</h5>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ maxHeight: '70vh',width:'68vw', overflowY: 'auto' }}>
            <GetNotCommunicated selectedLabel={selectlabel} office={officeid}/>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
            <button onClick={handleClose} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
        )}
    </div>
  );
};

export default NonCommunicatedMeters;
