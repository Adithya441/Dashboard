import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react'; // Apache ECharts wrapper for React
import { Modal, Button } from 'react-bootstrap';
import GetLoadSwitch from './GetLoadSwitch';
import './LoadSwitch.css';

const LoadSwitchStatus = ({ officeid }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataavailable, setDataAvailable] = useState(null);
  const [selectlabel, setSelectLabel] = useState(null);
  const [chartData, setChartData] = useState(null);

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getPowerConnectDisconnectStatus?applyMaskingFlag=N&officeid=${officeid}`;

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

      if (!tokenResponse.ok) {
        return { error: 'No Data Available' };
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const dataResponse = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!dataResponse.ok) {
        return { error: 'No Data Available' };
      }

      const responseBody = await dataResponse.text();
      if (!responseBody) {
        return { error: 'No Data Available' };
      }

      const responseData = JSON.parse(responseBody);

      if (!responseData || !responseData.ydata1 || !responseData.xData) {
        return { error: 'No Data Available' };
      }

      const total = responseData.ydata1.slice(0, 2).reduce((acc, curr) => acc + curr, 0);
      const series = responseData.ydata1.slice(0, 2);
      const labels = responseData.xData.slice(0, 2);

      return { data: { total, series, labels } };
    } catch (err) {
      console.error("Error fetching data: ", err.message);
      return { error: 'No Data Available' };
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      const result = await fetchData();

      if (!mounted) return;

      if (result.error) {
        setDataAvailable(result.error);
        setChartData(null);
      } else {
        setDataAvailable(null);
        setChartData(result.data);
      }
      setLoading(false);
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [officeid]);

  const getChartOptions = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: 'Load Switch Status',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          data: chartData?.labels?.map((label, index) => ({
            value: chartData?.series[index],
            name: label,
          })),
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)', // Display value and percentage on the donut
          },
          itemStyle: {
            normal: {
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
        },
      ],
    };
  };
  const onChartClick = (params) => {
    console.log("Chart clicked:", params);
    setSelectLabel(params.name); // Update selected label
    setShowModal(true); // Open modal
  }

  return (
    <div className='blck5'>
      <h5 className='chart-name'>Load Switch Status</h5>
      {loading ? (
        <div className="no-data-available">Loading...</div>
      ) : dataavailable ? (
        <div className="no-data-available">{dataavailable}</div>
      ) : chartData ? (
        <div className="charts5">
          <ReactECharts
            option={getChartOptions()}
            style={{ width: '100%', height: '100%' }}
            onEvents={{
              click: onChartClick, // Attach the event handler
            }}
          />
        </div>
      ) : (
        <div className="no-data-available">No Data Available</div>
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
            width: '1000px',
            borderRadius: '5px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            padding: '1em',
            marginLeft: '125px',
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 id="contained-modal-title-vcenter">{selectlabel}</h5>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ maxHeight: '70vh', width: '970px', overflowY: 'auto' }}>
            <GetLoadSwitch selectedLabel={selectlabel} office={officeid} />
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadSwitchStatus;
