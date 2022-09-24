import React, { useState, useEffect, useRef } from "react";
import RecordButton from "../../UI/RecordButton/RecordButton";
import TextField from "@mui/material/TextField";
import styles from "./LiveChartComponent.module.css";
import LiveChart from "./LiveChart";

// const serverBaseURL = "http://10.0.0.97/gap/nodes?event=1&filter_mac=50:31*";
// const serverBaseURL =
// "http://10.1.10.150/gap/nodes?event=1&filter_mac=C8:D0:83:E2:7A*";
const serverBaseURL = "http://10";

const LiveChartComponent = (props) => {
  const toggleRef = useRef(false);
  const inputRef = useRef(0);
  const series = useRef([{ data: [], id: Math.random() }]);
  const [graphPoints, updateGraphPoints] = useState([]);

  const clickToggleHandler = (shouldRecord) => {
    toggleRef.current = shouldRecord;
    if (!shouldRecord) {
      // This part sends the most current data to Preview Component.
      // If the length is more than zero then send to Preview
      const latestData = series.current[series.current.length - 1];
      if (latestData.length > 0) props.displayThisInstance(latestData.data);

      props.onReceiveData(series.current);
      series.current = [...series.current, { data: [], id: Math.random() }];
    }
    props.onTimerRefresh(toggleRef.current);
  };

  useEffect(() => {
    const eventSource = new EventSource(serverBaseURL);
    eventSource.addEventListener("error", (e) => {
      eventSource.close();
      console.log("error occurred");
    });
    eventSource.addEventListener("open", () => {
      console.log("SSE opened!");
    });
    eventSource.addEventListener("close", () => eventSource.close());
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      //update line chart
      updateGraphPoints((prev) => {
        let newChartPoints = prev ? [...prev] : [];

        const x = new Date();
        const y = data.rssi;

        if (toggleRef.current) {
          newChartPoints.push({ date: x, recordedRssi: y });
        } else {
          newChartPoints.push({ date: x, rssi: y });
        }
        if (newChartPoints.length > 10) newChartPoints.shift();
        return newChartPoints;
      });
      if (toggleRef.current) {
        let newSeries = [...series.current];
        newSeries[newSeries.length - 1].data.push({
          x: new Date(),
          y: data.rssi,
          distance: inputRef.current.value,
        });
        series.current = newSeries;
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <div className={styles["chart-container"]}>
        <LiveChart graphPoints={graphPoints} />
      </div>
      <div className={styles.actions}>
        <RecordButton onClick={clickToggleHandler} disable={props.shouldStop} />
        <label htmlFor="inputDistance">Distance</label>
        <TextField
          id="inputDistance"
          label="Distance"
          variant="outlined"
          type="number"
          placeholder="distance in feet"
          inputRef={inputRef}
          disabled={props.shouldStop || toggleRef.current}
        />
      </div>
    </div>
  );
};

// export default React.memo(LineChartComponent);

export default LiveChartComponent;
