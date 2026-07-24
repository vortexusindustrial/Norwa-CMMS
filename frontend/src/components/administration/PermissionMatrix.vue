<script setup>
import { computed } from "vue";
import { ROLES, SECTION_ACCESS } from "../../permissions";

const roleColumns = Object.values(ROLES);

const HUMANIZE_OVERRIDES = { bom: "BoM", tco: "TCO", mttr: "MTTR" };
function humanize(key) {
  if (HUMANIZE_OVERRIDES[key]) return HUMANIZE_OVERRIDES[key];
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const groups = computed(() => {
  const topLevelKeys = Object.keys(SECTION_ACCESS).filter(
    (key) => !key.includes("."),
  );
  return topLevelKeys.map((key) => ({
    key,
    label: humanize(key),
    levels: SECTION_ACCESS[key],
    children: Object.keys(SECTION_ACCESS)
      .filter((childKey) => childKey.startsWith(`${key}.`))
      .map((childKey) => ({
        key: childKey,
        label: humanize(childKey.slice(key.length + 1)),
        levels: SECTION_ACCESS[childKey],
      })),
  }));
});
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center gap-4 text-xs text-gray-500">
      <span class="flex items-center gap-1.5"
        ><span class="h-2.5 w-2.5 rounded-full bg-green-500" /> Full</span
      >
      <span class="flex items-center gap-1.5"
        ><span class="h-2.5 w-2.5 rounded-full bg-blue-500" /> Scoped</span
      >
      <span class="flex items-center gap-1.5"
        ><span class="h-2.5 w-2.5 rounded-full border-2 border-violet-500" />
        View only</span
      >
      <span class="flex items-center gap-1.5"
        ><span class="text-gray-300">&mdash;</span> No access</span
      >
    </div>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr
            class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            <th class="px-3 py-2">Component</th>
            <th
              v-for="role in roleColumns"
              :key="role"
              class="px-3 py-2 text-center"
            >
              {{ role }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.key">
            <tr class="border-b border-gray-100">
              <td class="px-3 py-2 font-medium text-gray-900">
                {{ group.label }}
              </td>
              <td
                v-for="role in roleColumns"
                :key="role"
                class="px-3 py-2 text-center"
              >
                <span
                  v-if="group.levels[role] === 'full'"
                  class="inline-block h-2.5 w-2.5 rounded-full bg-green-500"
                  title="Full"
                />
                <span
                  v-else-if="group.levels[role] === 'scoped'"
                  class="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"
                  title="Scoped"
                />
                <span
                  v-else-if="group.levels[role] === 'view'"
                  class="inline-block h-2.5 w-2.5 rounded-full border-2 border-violet-500"
                  title="View only"
                />
                <span v-else class="text-gray-300">&mdash;</span>
              </td>
            </tr>
            <tr
              v-for="child in group.children"
              :key="child.key"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="py-2 pl-7 pr-3 text-gray-600">{{ child.label }}</td>
              <td
                v-for="role in roleColumns"
                :key="role"
                class="px-3 py-2 text-center"
              >
                <span
                  v-if="child.levels[role] === 'full'"
                  class="inline-block h-2 w-2 rounded-full bg-green-500"
                  title="Full"
                />
                <span
                  v-else-if="child.levels[role] === 'scoped'"
                  class="inline-block h-2 w-2 rounded-full bg-blue-500"
                  title="Scoped"
                />
                <span
                  v-else-if="child.levels[role] === 'view'"
                  class="inline-block h-2 w-2 rounded-full border-2 border-violet-500"
                  title="View only"
                />
                <span v-else class="text-gray-300">&mdash;</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
