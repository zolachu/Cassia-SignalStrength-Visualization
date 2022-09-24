import React from "react";
import "chartjs-plugin-streaming";
import { Line, Bar, Box } from "react-chartjs-2";
import "chartjs-plugin-streaming";

import Chart from "react-chartjs-2";
import "chartjs-chart-box-and-violin-plot/build/Chart.BoxPlot.js";

const PreviewComponent = (props) => {
  console.log("render", props.radioValue);
  let options = props.options;
  let data = props.data;

  if (props.radioValue === "boxplot") {
    console.log("inside boxplot");
    options = {
      responsive: true,
      title: {
        display: true,
        text: "Box Plot Chart",
      },
    };
  }

  let arrayRSSI = [];

  if (props.data && props.data.datasets && props.data.datasets[0].data) {
    arrayRSSI = props.data.datasets[0].data.map((item) => item.y);
  }
  console.log(arrayRSSI);
  const boxplotData = {
    labels: ["Rssi Sensor value"],
    datasets: [
      {
        label: "Dataset 1",
        backgroundColor: "rgba(255,0,0,0.5)",
        borderColor: "red",
        borderWidth: 1,
        outlierColor: "#999999",
        padding: 10,
        itemRadius: 0,
        data: [arrayRSSI],
      },
    ],
  };

  // let type = props.radioValue;

  // const data = props.radioValue === "boxplot" ? boxplotData : props.data;

  console.log(props.radioValue);

  return (
    <>
      {props.radioValue === "line" && (
        <Chart
          type="line"
          height={200}
          datasetKeyProvider={props.datasetKeyProvider}
          // data={props.data}
          // options={props.options}
          data={data}
          options={options}
        />
      )}
      {props.radioValue === "bar" && (
        <Chart
          type="bar"
          height={200}
          datasetKeyProvider={props.datasetKeyProvider}
          // data={props.data}
          // options={props.options}
          data={data}
          options={options}
        />
      )}
      {props.radioValue === "boxplot" && (
        <Chart
          type="boxplot"
          height={200}
          datasetKeyProvider={props.datasetKeyProvider}
          // data={props.data}
          // options={props.options}
          data={boxplotData}
          options={{
            responsive: true,
            title: {
              display: true,
              text: "Chart.js Box Plot Chart",
            },
          }}
        />
      )}
      {/* <Chart
        type={type}
        height={200}
        datasetKeyProvider={props.datasetKeyProvider}
        // data={props.data}
        // options={props.options}
        data={data}
        options={options}
      /> */}
    </>
  );
};

export default PreviewComponent;
