<template>
 <Navbar class="edit" /> 
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Edit Form</h1>

    <form @submit.prevent="updateForm" class="space-y-6">
      <!-- Form Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Form Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <!-- Sections -->
      <div v-for="(section, sectionIndex) in form.sections" :key="sectionIndex" class="mb-8 border p-4 rounded-lg">
        <!-- Section Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Section Name</label>
          <div class="flex items-center gap-2">
            <input
              v-model="section.section_name"
              type="text"
              class="flex-1 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
            />
            <button
              @click="removeSection(sectionIndex)"
              type="button"
              class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              Remove Section
            </button>
          </div>
        </div>

        <!-- Questions within Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Questions</label>
          <div
            v-for="(question, questionIndex) in section.questions"
            :key="questionIndex"
            class="mt-4 p-4 border rounded-md"
          >
            <!-- Question Text -->
            <label class="block text-sm font-medium text-gray-700">Question Text</label>
            <input
              v-model="section.questions[questionIndex].questionText"
              type="text"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary mb-2"
              placeholder="Enter question"
              required
            />

            <!-- Answer Type -->
            <label class="block text-sm font-medium text-gray-700">Answer Type</label>
            <select
              v-model="section.questions[questionIndex].answerType"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary mb-2"
            >
              <option value="text">Text</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio</option>
              <option value="file">File Upload</option>
            </select>

            <!-- Options for Checkbox/Radio -->
            <div v-if="question.answerType === 'checkbox' || question.answerType === 'radio'" class="mt-4">
              <label class="block text-sm font-medium text-gray-700">Options</label>
              <div
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                class="flex items-center mb-2"
              >
                <input
                  v-model="section.questions[questionIndex].options[optIndex]"
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

            <!-- Remove Question -->
            <button
              @click="removeQuestion(sectionIndex, questionIndex)"
              type="button"
              class="mt-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              Remove Question
            </button>
          </div>

          <button
            @click="addQuestion(sectionIndex)"
            type="button"
            class="mt-4 px-3 py-1 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
          >
            + Add Question
          </button>
        </div>
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

      <!-- Add Section Button -->
      <button
        @click="addSection"
        type="button"
        class="px-3 py-1 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
      >
        + Add Section
      </button>

      <!-- Update Form Button -->
      <button
        type="submit"
        class="px-4 py-2 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
      >
        Update Form
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

definePageMeta({
  middleware: ['auth'],
});

const router = useRouter();
const route = useRoute();

const form = ref({
  title: "",
  sections: [],
});
const isLoading = ref(true);
const optionRefs = ref({});

// Fetch the form data based on the form ID
onMounted(async () => {
  const formId = route.params.id;

  try {
    const fetchedForm = await $fetch(`/api/forms/${formId}`);
    form.value = {
      title: fetchedForm.title,
      sections: fetchedForm.sections || [],
    };
  } catch (error) {
    console.error("Failed to fetch form:", error);
    alert("Could not load the form. Please try again.");
  } finally {
    isLoading.value = false;
  }
});

// Add a new section
function addSection() {
  form.value.sections.push({
    section_name: "",
    questions: [{ questionText: "", answerType: "text", options: [], useAI: false }],
  });
}

// Remove a section
function removeSection(sectionIndex) {
  if (confirm("Are you sure you want to remove this section and all its questions?")) {
    form.value.sections.splice(sectionIndex, 1);
  }
}

// Add a new question to a section
function addQuestion(sectionIndex) {
  form.value.sections[sectionIndex].questions.push({
    questionText: "",
    answerType: "text",
    options: [],
    useAI: false,
  });
}

// Remove a question from a section
function removeQuestion(sectionIndex, questionIndex) {
  form.value.sections[sectionIndex].questions.splice(questionIndex, 1);
}

// Add an option to a question
function addOption(sectionIndex, questionIndex, event = null) {
  if (event) event.preventDefault();
  form.value.sections[sectionIndex].questions[questionIndex].options.push("");
  nextTick(() => {
    const optionIndex = form.value.sections[sectionIndex].questions[questionIndex].options.length - 1;
    const refKey = `${sectionIndex}-${questionIndex}-${optionIndex}`;
    optionRefs.value[refKey]?.focus();
  });
}

// Remove an option from a question
function removeOption(sectionIndex, questionIndex, optionIndex) {
  form.value.sections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
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

// Validate form before updating
function validateForm() {
  if (!form.value.title.trim()) {
    alert("Form title is required.");
    return false;
  }

  if (form.value.sections.length === 0) {
    alert("Form must have at least one section.");
    return false;
  }

  for (const section of form.value.sections) {
    if (!section.section_name.trim()) {
      alert("Each section must have a name.");
      return false;
    }

    if (section.questions.length === 0) {
      alert("Each section must have at least one question.");
      return false;
    }

    for (const question of section.questions) {
      if (!question.questionText.trim()) {
        alert("Each question must have text.");
        return false;
      }
      if (["checkbox", "radio"].includes(question.answerType) && question.options.length === 0) {
        alert("Questions with checkbox or radio type must have at least one option.");
        return false;
      }
    }
  }
  return true;
}

// Update the form in the database
async function updateForm() {
  if (!validateForm()) return;

  const formId = route.params.id;

  try {
    await $fetch(`/api/forms/${formId}`, {
      method: "PUT",
      body: form.value,
    });
    alert("Form updated successfully!");
    router.push("/");
  } catch (error) {
    console.error("Failed to update form:", error);
    alert("Failed to update the form. Please try again.");
  }
}
</script>
