<script setup>
import { computed } from "vue";
import { AlertTriangle, OctagonAlert } from "lucide-vue-next";
import { HEALTH_STATUS_META } from "../../data/assets";

const props = defineProps({
  asset: { type: Object, required: true },
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(iso) {
  return dateTimeFormatter.format(new Date(iso));
}

const health = computed(() => props.asset.health);
const statusMeta = computed(() => HEALTH_STATUS_META[health.value.status]);

function sparkline(trend) {
  const width = 100;
  const height = 28;
  const pad = 4;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const span = max - min || 1;
  const points = trend.map((value, i) => {
    const x = trend.length > 1 ? (i / (trend.length - 1)) * width : width / 2;
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return [x, y];
  });
  return {
    linePoints: points
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" "),
    last: points[points.length - 1],
  };
}
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-4"
    >
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
          Health Score
        </p>
        <p class="mt-1 text-2xl font-semibold" :class="statusMeta.textClass">
          {{ health.healthScore }}
        </p>
      </div>
      <div class="text-right">
        <span
          class="rounded-full px-2.5 py-1 text-xs font-medium"
          :class="statusMeta.badgeClass"
        >
          {{ statusMeta.label }}
        </span>
        <p class="mt-1.5 text-xs text-gray-500">
          Last reading {{ formatDateTime(health.lastReadingAt) }}
        </p>
      </div>
    </div>

    <div v-if="health.alerts.length" class="mt-4 flex flex-col gap-2">
      <div
        v-for="alert in health.alerts"
        :key="alert.id"
        class="flex items-start gap-2 rounded-md border p-3 text-sm"
        :class="
          alert.severity === 'critical'
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        "
      >
        <OctagonAlert
          v-if="alert.severity === 'critical'"
          class="mt-0.5 h-4 w-4 shrink-0 text-red-600"
        />
        <AlertTriangle v-else class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p class="text-gray-900">{{ alert.message }}</p>
          <p class="mt-0.5 text-xs text-gray-500">
            {{ formatDateTime(alert.timestamp) }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="health.metrics.length"
      class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div
        v-for="metric in health.metrics"
        :key="metric.key"
        class="rounded-md border border-gray-200 p-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              {{ metric.label }}
            </p>
            <p class="mt-1 text-lg font-semibold text-gray-900">
              {{ metric.value
              }}<span class="ml-0.5 text-xs font-normal text-gray-500">{{
                metric.unit
              }}</span>
            </p>
            <p class="mt-0.5 text-xs text-gray-400">
              Normal {{ metric.range[0] }}&ndash;{{ metric.range[1]
              }}{{ metric.unit }}
            </p>
          </div>
          <svg width="100" height="28" viewBox="0 0 100 28" class="shrink-0">
            <polyline
              :points="sparkline(metric.trend).linePoints"
              fill="none"
              :stroke="HEALTH_STATUS_META[metric.status].strokeColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              :cx="sparkline(metric.trend).last[0]"
              :cy="sparkline(metric.trend).last[1]"
              r="2.5"
              :fill="HEALTH_STATUS_META[metric.status].strokeColor"
            />
          </svg>
        </div>
      </div>
    </div>
    <p
      v-else
      class="mt-4 rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500"
    >
      No live telemetry for this asset.
    </p>
  </div>
</template>
