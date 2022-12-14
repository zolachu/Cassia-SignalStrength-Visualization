import { Chart } from "react-chartjs-2";
import "chartjs-plugin-streaming";
// import "chartjs-plugin-datalabels";

var chartColors = {
  red: "rgb(255, 99, 132)",
  pink: "rgb(255, 8, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    // datalabels: {
    //   anchor: "end",
    //   align: "end",
    //   rotation: -45,
    // },
  },
  labels: { render: "value" },
  title: {
    display: true,
    text: "Recorded Data",
  },
  // pointBackgroundColor: "#fff",
  // radius: 100,
  scales: {
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "Timeline",
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value) {
            const d = new Date(value);
            return d.toLocaleTimeString();
          },
        },
      },
    ],
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "Signal Strength",
        },
        ticks: {
          stepSize: 1,
          suggestedMax: 0,
          suggestedMin: -50,
        },
      },
    ],
  },
};

const datasetKeyProvider = () => {
  return (Math.random() + 1).toString(36).substring(0, 12);
};

const config = [chartColors, datasetKeyProvider, options];
export default config;
