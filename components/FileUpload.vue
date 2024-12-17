<template>
  <div class="mb-6 p-4 bg-white shadow-lg border rounded-lg">
    <label class="block text-lg font-semibold text-gray-800 mb-4">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      type="file"
      @change="handleFileUpload"
      class="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-600"
    />
  </div>
</template>

<script setup>

const props = defineProps({
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
});

const emits = defineEmits(["file-uploaded"]);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        emits("file-uploaded", json);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
      }
    };
    reader.readAsText(file);
  } else {
    console.error("Please upload a valid JSON file.");
  }
}
</script>
