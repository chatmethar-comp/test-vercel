<template>
  <div class="mb-6 p-4 bg-white shadow-lg border rounded-lg">
    <label class="block text-lg font-semibold text-gray-800 mb-4">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      type="text"
      v-model="localValue"
      :placeholder="placeholder"
      class="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      :class="{ 'border-red-500': error }"
      @blur="validateInput"
      @keydown.enter.prevent
    />
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const localValue = ref(props.modelValue);
const error = ref("");

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  }
);

watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});

function validateInput() {
  if (props.required && !localValue.value) {
    error.value = `${props.label} is required.`;
  } else {
    error.value = "";
  }
}
</script>