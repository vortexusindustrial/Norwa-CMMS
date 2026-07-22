<script setup>
import { computed } from 'vue'

const props = defineProps({
  workOrders: { type: Array, required: true },
  scopeLabel: { type: String, default: null },
})

const MONTH_LABEL = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

const monthly = computed(() => {
  const buckets = new Map()
  for (const wo of props.workOrders) {
    if (wo.status !== 'completed') continue
    const dateStr = wo.scheduledDate ?? wo.createdDate
    const monthKey = dateStr.slice(0, 7) // 'YYYY-MM'
    const bucket = buckets.get(monthKey) ?? { totalMinutes: 0, count: 0 }
    bucket.totalMinutes += wo.timer.totalMinutes
    bucket.count += 1
    buckets.set(monthKey, bucket)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([monthKey, bucket]) => ({
      monthKey,
      label: MONTH_LABEL.format(new Date(`${monthKey}-01T00:00:00`)),
      avgHours: bucket.totalMinutes / bucket.count / 60,
      count: bucket.count,
    }))
})

// Chart geometry — a fixed viewBox scaled responsively via width: 100%.
const WIDTH = 640
const HEIGHT = 200
const PAD = { top: 16, right: 16, bottom: 28, left: 36 }
const plotWidth = WIDTH - PAD.left - PAD.right
const plotHeight = HEIGHT - PAD.top - PAD.bottom

const maxHours = computed(() => Math.max(...monthly.value.map((m) => m.avgHours), 1) * 1.2)

function xFor(index) {
  const n = monthly.value.length
  return n <= 1 ? PAD.left + plotWidth / 2 : PAD.left + (index / (n - 1)) * plotWidth
}
function yFor(hours) {
  return PAD.top + plotHeight - (hours / maxHours.value) * plotHeight
}

const points = computed(() => monthly.value.map((m, i) => ({ ...m, x: xFor(i), y: yFor(m.avgHours) })))
const linePath = computed(() => points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '))

const gridLines = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => {
    const hours = (maxHours.value / steps) * i
    return { y: yFor(hours), label: hours.toFixed(1) }
  })
})

const MTTR_COLOR = '#F59E0B' 
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <p class="text-xs text-gray-500">
      Average repair duration per month, from completed work orders<span v-if="scopeLabel"> &middot; {{ scopeLabel }}</span>
    </p>

    <div v-if="!monthly.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
      No completed work orders yet.
    </div>
    <template v-else>
      <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="mt-4 w-full" role="img" aria-label="MTTR trend by month">
        <line
          v-for="grid in gridLines"
          :key="grid.y"
          :x1="PAD.left"
          :x2="WIDTH - PAD.right"
          :y1="grid.y"
          :y2="grid.y"
          stroke="#E5E7EB"
          stroke-width="1"
        />
        <text
          v-for="grid in gridLines"
          :key="`label-${grid.y}`"
          :x="PAD.left - 8"
          :y="grid.y + 3"
          text-anchor="end"
          class="fill-gray-400 text-[9px]"
        >
          {{ grid.label }}h
        </text>

        <path :d="linePath" fill="none" :stroke="MTTR_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        <g v-for="(p, i) in points" :key="p.monthKey">
          <circle :cx="p.x" :cy="p.y" r="4" :fill="MTTR_COLOR">
            <title>{{ p.label }}: {{ p.avgHours.toFixed(1) }}h avg &middot; {{ p.count }} repair(s)</title>
          </circle>
          <text :x="p.x" :y="HEIGHT - 8" text-anchor="middle" class="fill-gray-500 text-[9px]">
            {{ p.label.split(' ')[0] }}
          </text>
        </g>
      </svg>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th class="px-3 py-2">Month</th>
              <th class="px-3 py-2 text-right">Avg MTTR (hours)</th>
              <th class="px-3 py-2 text-right">Repairs Completed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthly" :key="m.monthKey" class="border-b border-gray-100 last:border-0">
              <td class="px-3 py-2 text-gray-900">{{ m.label }}</td>
              <td class="px-3 py-2 text-right text-gray-900">{{ m.avgHours.toFixed(1) }}</td>
              <td class="px-3 py-2 text-right text-gray-500">{{ m.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
