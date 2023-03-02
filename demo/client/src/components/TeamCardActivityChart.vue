<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const data: ChartData<"line"> = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      data: [1.5, 2, 2.5, 2, 2.3, 2, 2.8],
      backgroundColor: "rgba(0, 255, 0, 0.05)",
      borderColor: "green",
      borderWidth: 2,
      pointBorderWidth: 0,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: true,
      tension: 0.2,
    },
  ],
};

const options: ChartOptions<"line"> = {
  aspectRatio: 7,
  layout: {
    padding: {
      top: 5,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    filler: {
      drawTime: "beforeDatasetsDraw",
      propagate: true,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
};
</script>

<template>
  <Line :data="data" :options="options" />
</template>
