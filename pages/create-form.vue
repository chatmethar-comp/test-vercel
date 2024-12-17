<template>
  <Navbar/>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Create Form</h1>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
      <input
        v-model="formTitle"
        type="text"
        class="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter form title"
      />
    </div>

    <!-- Sections -->
    <div v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="mb-8 p-4 border rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
          <input
            v-model="section.section_name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter section name"
          />
        </div>
        <button
          @click="removeSection(sectionIndex)"
          type="button"
          class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
        >
          Delete Section
        </button>
      </div>

      <!-- Questions within section -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Questions</h2>
        <div v-for="(question, questionIndex) in section.questions" :key="questionIndex" class="mb-6 p-4 border rounded-md">
          <div class="flex justify-between gap-4 items-center mb-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
              <input
                v-model="question.questionText"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Enter question text"
              />
            </div>
            <button
              @click="removeQuestion(sectionIndex, questionIndex)"
              type="button"
              class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              Delete Question
            </button>
          </div>

          <label class="block text-sm font-medium text-gray-700 mb-2">Answer Type</label>
          <select
            v-model="question.answerType"
            class="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="file">File Upload</option>
          </select>

          <div v-if="question.answerType === 'checkbox' || question.answerType === 'radio'" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              class="flex items-center mb-2"
            >
              <input
                v-model="question.options[optIndex]"
                type="text"
                class="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Option text"
                @keydown.enter="addOption(sectionIndex, questionIndex, $event)"
                :ref="setOptionRef(sectionIndex, questionIndex, optIndex)"
              />
              <button
                @click="removeOption(sectionIndex, questionIndex, optIndex)"
                type="button"
                class="ml-2 px-2 py-1 text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <button
              @click="addOption(sectionIndex, questionIndex)"
              type="button"
              class="text-sm text-blue-500 hover:underline"
            >
              + Add Option
            </button>
          </div>

        </div>
        <button
          @click="addQuestion(sectionIndex)"
          type="button"
          class="mt-4 px-3 py-1 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
        >
          + Add Question
        </button>
      </div>
      <!-- AI Toggle -->
      <div class="mt-4 flex items-center">
        <input
          :id="`use-ai-checkbox-${sectionIndex}`"
          type="checkbox"
          v-model="section.useAI"
          class="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <label :for="`use-ai-checkbox-${sectionIndex}`" class="ml-2 text-sm font-medium text-gray-700">Use AI</label>
      </div>
    </div>

    <button
      @click="addSection"
      type="button"
      class="mb-4 px-3 py-1 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
    >
      + Add Section
    </button>

    <button
      @click="saveForm"
      type="button"
      class="px-4 py-2 bg-star-primary-red-300 cursor-pointer text-white rounded-md disabled:bg-star-primary-red-500"
      :disabled="isSaving"
    >
      Save Form
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  middleware: ['auth'],
});

const router = useRouter();
const formTitle = ref("");
const sections = ref([
  {
    section_name: "",
    questions: [{ questionText: "", answerType: "text", options: [], useAI: false }],
  },
]);
const optionRefs = ref({});
const isSaving = ref(false);

function addSection() {
  sections.value.push({
    section_name: "",
    questions: [{ questionText: "", answerType: "text", options: [], useAI: false }],
  });
}

function removeSection(sectionIndex) {
  if (confirm("Are you sure you want to remove this section and all its questions?")) {
    sections.value.splice(sectionIndex, 1);
  }
}

function addQuestion(sectionIndex) {
  sections.value[sectionIndex].questions.push({
    questionText: "",
    answerType: "text",
    options: [],
    useAI: false,
  });
}

function removeQuestion(sectionIndex, questionIndex) {
  sections.value[sectionIndex].questions.splice(questionIndex, 1);
}

function addOption(sectionIndex, questionIndex, event = null) {
  if (event) event.preventDefault();
  sections.value[sectionIndex].questions[questionIndex].options.push("");
  nextTick(() => {
    const optionIndex = sections.value[sectionIndex].questions[questionIndex].options.length - 1;
    const refKey = `${sectionIndex}-${questionIndex}-${optionIndex}`;
    optionRefs.value[refKey]?.focus();
  });
}

function removeOption(sectionIndex, questionIndex, optionIndex) {
  sections.value[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
}

// Set the ref for the option input
function setOptionRef(sectionIndex, questionIndex, optionIndex) {
  return (el) => {
    const refKey = `${sectionIndex}-${questionIndex}-${optionIndex}`;
    if (el) {
      optionRefs.value[refKey] = el;
    } else {
      delete optionRefs.value[refKey];
    }
  };
}

async function saveForm() {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    const authStore = useAuthStore();
    const response = await $fetch("/api/forms", {
      method: "POST",
      body: { 
        title: formTitle.value, 
        sections: sections.value,
        creator: authStore.user.value !== null ? authStore.user.value.id : ""
      },
    });

    router.push(`/form/${response.id}`);
  } catch (error) {
    console.error("Error saving form:", error);
  } finally {
    isSaving.value = false;
  }
}
</script>