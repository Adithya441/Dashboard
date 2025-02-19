import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import GetNeverCommunicated from "./GetNeverCommunicated";
import "./NeverCommunicatedMeters.css";

const NeverCommunicatedMeters = ({ officeid }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], series: [] });
  const [selectLabel, setSelectLabel] = useState(null);

  const tokenUrl = "/api/server3/UHES-0.0.1/oauth/token";
  const baseUrl = `/api/server3/UHES-0.0.1/WS/getCommissionedButNotCommunicated?officeid=${officeid}`;

  const fetchData = async () => {
    setLoading(true);
    setDataAvailable(null);

    try {
      // Fetch token
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: "Admin",
          password: "Admin@123",
          client_id: "fooClientId",
          client_secret: "secret",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to fetch token");
      }

      const { access_token: accessToken } = await tokenResponse.json();

      // Fetch data
      const dataResponse = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!dataResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const responseData = await dataResponse.json();
      console.log("API Response:", responseData);

      // Validate response
      if (!responseData || !responseData.yData || !responseData.xData || !responseData.yData.length) {
        throw new Error("Invalid API Response");
      }

      // Set chart data
      setChartData({
        labels: responseData.xData,
        series: responseData.yData[0]?.data || [],
      });

    } catch (err) {
      console.error("Error fetching data:", err);
      setDataAvailable("No Data Available");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [officeid]);

  // Chart Options
  const options = {
    title: { text: "Never Communicated Meters", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: chartData.labels.length ? chartData.labels : ["No Data"],
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Meters",
        type: "bar",
        data: chartData.series.length ? chartData.series : [0],
        itemStyle: { color: "#DE6E56" },
        label: { show: true, position: "top" },
      },
    ],
    grid: { left: "10%", right: "10%", bottom: "15%", containLabel: true },
  };

  const handleChartClick = (params) => {
    setSelectLabel(params.name);
    setSelectedData({ label: params.name, value: params.value });
    setShowModal(true);
  };

  return (
    <div className="blck4">
      {loading ? (
        <div>Loading...</div>
      ) : dataAvailable ? (
        <div className="no-data-available">{dataAvailable}</div>
      ) : (
        <div className="charts4">
          <ReactECharts
            option={options}
            style={{ width: "100%", height: "90%" }}
            onEvents={{ click: handleChartClick }}
          />

          {showModal && (
            <div
              style={{
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
                marginLeft: "85px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5>{selectLabel}</h5>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                  }}
                >
                  &times;
                </button>
              </div>

              <div style={{ maxHeight: "70vh", width: "970px", overflowY: "auto" }}>
                <GetNeverCommunicated selectedLabel={selectLabel} office={officeid} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1em" }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "0.5em 1em", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NeverCommunicatedMeters;
