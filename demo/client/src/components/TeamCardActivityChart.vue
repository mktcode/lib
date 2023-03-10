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
import { computed } from "vue";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const props = defineProps<{
  repoScan: {
    commitsByDay: {
      [key: string]: { commitCount: number; linesChanged: number };
    };
    commitsByDayNormalized: { commitCount: number[]; linesChanged: number[] };
  };
}>();

const data = computed<ChartData<"line">>(() => {
  return {
    labels: Object.keys(props.repoScan.commitsByDay),
    datasets: [
      {
        data: props.repoScan.commitsByDayNormalized.commitCount,
        backgroundColor: "rgba(0, 255, 0, 0.05)",
        borderColor: "green",
        borderWidth: 2,
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        tension: 0.2,
      },
      {
        data: props.repoScan.commitsByDayNormalized.linesChanged,
        backgroundColor: "rgba(255, 0, 0, 0.05)",
        borderColor: "red",
        borderWidth: 1,
        pointBorderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        tension: 0.2,
      },
    ],
  };
});

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
