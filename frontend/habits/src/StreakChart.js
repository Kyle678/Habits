import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend);

const StreakChart = () => {
  // Data with endpoints and intermediate points
  const dataPoints = [
    { date: '2025-01-01', value: 1, label: 'Started Streak' },
    { date: '2025-01-02', value: 2 }, // Intermediate
    { date: '2025-01-03', value: 3 }, // Intermediate
    { date: '2025-01-05', value: 5 },
    { date: '2025-01-05', value: 0, label: 'Reset: Missed Gym' }, // Reset
    { date: '2025-01-06', value: 1, label: 'Restarted Streak' },
    { date: '2025-01-07', value: 2 }, // Intermediate
    { date: '2025-01-10', value: 5 }, // Custom endpoint
  ];

  // Transform data for the chart
  const data = {
    labels: dataPoints.map((point) => point.date), // Dates for X-axis
    datasets: [
      {
        label: 'Streak Progress',
        data: dataPoints.map((point) => ({
          x: point.date,
          y: point.value,
        })), // Plot data with time
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        tension: 0, // Smooth lines
        fill: false,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const point = dataPoints[tooltipItem.dataIndex];
            return point.label || ''; // Show label only if defined
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time', // Use time scale for spacing based on dates
        time: {
          unit: 'day', // Dynamically adjust based on dataset
          displayFormats: {
            day: 'MMM d', // Example: Jan 1
          },
        },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Streak Length' },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 3, // Small dots for clarity
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default StreakChart;
