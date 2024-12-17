<template>
  <div class="mb-6 p-4 bg-white shadow-lg border rounded-lg">
    <label class="block text-lg font-semibold text-gray-800 mb-4">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="space-y-3">
      <div
        v-for="option in options"
        :key="option"
        class="flex items-center p-3 rounded-lg border transition-colors cursor-pointer hover:bg-purple-50"
        :class="{
          'bg-purple-100 border-purple-400': modelValue === option,
          'border-gray-300': modelValue !== option,
        }"
        @click="$emit('update:modelValue', option)"
      >
        <input
          type="radio"
          :id="option"
          :name="label"
          :value="option"
          :checked="modelValue === option"
          class="hidden peer"
        />
        <label
          :for="option"
          class="text-lg font-medium text-gray-800 cursor-pointer w-full"
        >
          {{ option }}
        </label>
        <span
          v-if="modelValue === option"
          class="ml-auto text-purple-600 font-bold"
        >
          ✔
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  modelValue: String,
  label: { type: String, required: true },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
});
</script>
