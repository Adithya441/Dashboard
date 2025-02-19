import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import GetNotCommunicated from './GetNotCommunicated';
import './NonCommunicatedMeters.css';

const NonCommunicatedMeters = ({ officeid }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const tokenUrl = '/api/server3/UHES-0.0.1/oauth/token';
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getmeterCommunicationStatus?officeid=${officeid}`;

  const fetchData = async () => {
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

      if (!tokenResponse.ok) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }

      const { access_token: accessToken } = await tokenResponse.json();
      const dataResponse = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }

      const responseData = await dataResponse.json();
      if (!responseData || !responseData.yData || !responseData.xData) {
        setDataAvailable("No Data Available");
        setLoading(false);
        return;
      }

      setChartData({
        labels: responseData.xData,
        series: responseData.yData,
      });
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setDataAvailable("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [officeid]);

  const handleChartClick = (params) => {
    setSelectedLabel(params.name);
    setSelectedData({ label: params.name, value: params.value });
    setShowModal(true);
  };

  const getChartOptions = () => ({
    title: { 
      text: 'Non Communicated Meters',
      left: '10%',
     },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: chartData ? chartData.labels : [],
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Meters',
        type: 'bar',
        data: chartData ? chartData.series[0].data : [],
        itemStyle: { color: '#619ED6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  });

  return (
    <div className="blck3">
      {loading ? (
        <div>Loading...</div>
      ) : dataAvailable ? (
        <div className="no-data-available">{dataAvailable}</div>
      ) : chartData ? (
        <ReactECharts option={getChartOptions()} onEvents={{ click: handleChartClick }} style={{ width: '100%', height: '95%' }} />
      ) : (
        <div>No Data Available</div>
      )}

      {showModal && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1050,
          backgroundColor: "#fff",
          width: "1000px",
          borderRadius: "5px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          padding: "1em",
          marginLeft: "125px",
        }}
         className="custom-modal">
          <div className="modal-header">
            <h5>{selectedLabel}</h5>
            <button onClick={() => setShowModal(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <GetNotCommunicated selectedLabel={selectedLabel} office={officeid} />
          </div>
          <div className="modal-footer">
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonCommunicatedMeters;
