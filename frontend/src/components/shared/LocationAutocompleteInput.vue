<script setup>
import { ref, watch, onBeforeUnmount, markRaw } from "vue";
import { MapPin } from "lucide-vue-next";
import {
  loadGoogleMapsLibrary,
  googleMapsApiKeyConfigured,
} from "../../utils/googleMaps";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Search for a location..." },
});

// 'update:modelValue' fires on every keystroke, for plain v-model text
// binding. 'select' only fires once the user picks a suggestion, carrying
// the geocoded place — that's the payload worth persisting.
const emit = defineEmits(["update:modelValue", "select"]);

const query = ref(props.modelValue);
watch(
  () => props.modelValue,
  (value) => {
    if (value !== query.value) query.value = value;
  },
);

const suggestions = ref([]);
const showSuggestions = ref(false);
const loading = ref(false);

let AutocompleteSuggestionCtor = null;
let AutocompleteSessionTokenCtor = null;
let placesLibraryReady = false;
let sessionToken = null;
let debounceTimer = null;

async function ensurePlacesLibrary() {
  if (placesLibraryReady) return true;
  if (!googleMapsApiKeyConfigured) return false;
  const places = await loadGoogleMapsLibrary("places");
  AutocompleteSuggestionCtor = places.AutocompleteSuggestion;
  AutocompleteSessionTokenCtor = places.AutocompleteSessionToken;
  placesLibraryReady = true;
  return true;
}

async function fetchSuggestions(input) {
  if (!input.trim()) {
    suggestions.value = [];
    return;
  }
  const ready = await ensurePlacesLibrary();
  if (!ready) return;
  if (!sessionToken) sessionToken = new AutocompleteSessionTokenCtor();

  loading.value = true;
  try {
    const { suggestions: results } =
      await AutocompleteSuggestionCtor.fetchAutocompleteSuggestions({
        input,
        sessionToken,
        includedRegionCodes: ["ke"],
      });
    suggestions.value = results
      .filter((s) => s?.placePrediction?.placeId)
      .map((s) => markRaw(s));
  } catch (err) {
    console.error("Location autocomplete failed:", err);
    suggestions.value = [];
  } finally {
    loading.value = false;
  }
}

function onInput(event) {
  const value = event.target.value;
  query.value = value;
  emit("update:modelValue", value);
  showSuggestions.value = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchSuggestions(value), 300);
}

async function selectSuggestion(suggestion) {
  const prediction = suggestion.placePrediction;
  const place = prediction.toPlace();
  await place.fetchFields({ fields: ["formattedAddress", "location"] });

  const address = place.formattedAddress ?? prediction.text.text;
  query.value = address;
  emit("update:modelValue", address);
  emit("select", {
    address,
    placeId: place.id,
    lat: place.location?.lat() ?? null,
    lng: place.location?.lng() ?? null,
  });

  suggestions.value = [];
  showSuggestions.value = false;
  sessionToken = null;
}

function onBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
}

onBeforeUnmount(() => clearTimeout(debounceTimer));
</script>

<template>
  <div class="relative">
    <input
      :value="query"
      type="text"
      :placeholder="placeholder"
      class="block w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm"
      @input="onInput"
      @focus="showSuggestions = true"
      @blur="onBlur"
    />
    <p
      v-if="!googleMapsApiKeyConfigured"
      class="mt-1 text-[11px] text-gray-400"
    >
      Add VITE_GOOGLE_MAPS_API_KEY to enable location suggestions.
    </p>
    <ul
      v-else-if="showSuggestions && (suggestions.length || loading)"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm"
    >
      <li v-if="loading" class="px-3 py-2 text-xs text-gray-400">
        Searching...
      </li>
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.placePrediction.placeId"
        class="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        <MapPin class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        {{ suggestion.placePrediction.text.text }}
      </li>
    </ul>
  </div>
</template>
