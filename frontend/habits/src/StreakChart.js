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
} from 'chart.js';

// Register components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const StreakChart = () => {
  const data = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'], // X-axis labels
    datasets: [
      {
        label: 'Streak Progress',
        data: [1, 2, 3, 4, 0, 1], // Streak values
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const reasons = [
              'Initial streak',
              'On track',
              'Doing great',
              'Reset: Missed gym',
              'Reset: Ate junk food',
              'Started again',
            ];
            return reasons[tooltipItem.dataIndex];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date or Progress' },
      },
      y: {
        title: { display: true, text: 'Streak Length' },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default StreakChart;
