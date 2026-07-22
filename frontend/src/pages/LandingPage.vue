<script setup>
const industries = [
  'Manufacturing & heavy industrial plants',
  'Facilities & property management',
  'Fleet & heavy logistics infrastructure',
  'Water & utilities grids',
]

const objectives = [
  {
    title: 'Total cost of ownership',
    body: 'Track acquisition cost, depreciation, spare parts, and labor against every asset.',
  },
  {
    title: 'Field-speed operations',
    body: 'Read/write API operations stay fast enough for technicians working in the field.',
  },
  {
    title: 'Offline-first technicians',
    body: 'Local caching and queued sync keep work orders moving without a live connection.',
  },
  {
    title: 'Lower mean time to repair',
    body: 'Better routing, asset state visibility, and predictive workflows cut repair time.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900">
    <header class="border-b border-gray-200">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span class="text-lg font-semibold tracking-tight">NORWA CMMS</span>
        <RouterLink
          to="/cmms/login"
          class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Sign In
        </RouterLink>
      </div>
    </header>

    <section class="border-b border-gray-200 bg-gray-50">
      <div class="mx-auto max-w-6xl px-6 py-24">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Frappe-native &middot; ERPNext v15 integration
        </p>
        <h1 class="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl" style="text-wrap: balance;">
          Maintenance operations and your ERP, on one data layer.
        </h1>
        <p class="mt-5 max-w-xl text-base leading-relaxed text-gray-600">
          Norwa CMMS bridges maintenance operations and core ERP workflows —
          work orders, asset downtime, spare parts, labor logs, and
          accounting share a single Frappe/ERPNext data layer instead of
          living in separate systems.
        </p>
        <div class="mt-8 flex gap-3">
          <RouterLink
            to="/cmms/login"
            class="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Sign In
          </RouterLink>
          <!-- <a
            href="https://frappeframework.com/"
            target="_blank"
            rel="noopener"
            class="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white"
          >
            About Frappe Framework
          </a> -->
        </div>
      </div>
    </section>

    <section class="border-b border-gray-200">
      <div class="mx-auto max-w-6xl px-6 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Built for
        </p>
        <ul class="mt-4 flex flex-wrap justify-content gap-x-8 gap-y-2 text-sm text-gray-700">
          <li v-for="industry in industries" :key="industry">{{ industry }}</li>
        </ul>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="text-xl font-semibold tracking-tight text-gray-900">Core objectives</h2>
      <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="objective in objectives" :key="objective.title">
          <div class="h-1 w-8 bg-amber-500"></div>
          <h3 class="mt-4 text-sm font-semibold text-gray-900">{{ objective.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ objective.body }}</p>
        </div>
      </div>
    </section>

    <footer class="border-t border-gray-200">
      <div class="mx-auto max-w-6xl px-6 py-8 text-xs text-gray-400">
        Built on Frappe Framework &amp; ERPNext v15 &middot; currently at blueprint stage
      </div>
    </footer>
  </div>
</template>
