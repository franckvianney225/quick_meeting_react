'use client';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
}

export default function PieChart({ data, title, height = 300 }: PieChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  // Couleurs par défaut si non fournies
  const defaultColors = [
    'rgba(54, 162, 235, 0.8)',  // Blue
    'rgba(255, 99, 132, 0.8)',  // Red
    'rgba(75, 192, 192, 0.8)',  // Green
    'rgba(255, 159, 64, 0.8)',  // Orange
    'rgba(153, 102, 255, 0.8)', // Purple
    'rgba(255, 205, 86, 0.8)',  // Yellow
  ];

  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors.slice(0, data.labels.length),
      borderColor: dataset.borderColor || 'rgba(255, 255, 255, 0.8)',
      borderWidth: dataset.borderWidth || 2,
    })),
  };

  return (
    <div style={{ height }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}