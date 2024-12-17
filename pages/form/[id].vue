<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div
      v-if="!isThankYouPageVisible"
      class="max-w-md w-full p-6 bg-white rounded-lg shadow-md flex flex-col justify-between"
      :style="{ height: '75vh' }"
    >
        <!-- Title -->
        <div>
          <h1 class="text-xl font-bold text-gray-800 mb-4 text-center">
            {{ form.title }}
          </h1>
          <p class="text-gray-500 mb-6 text-center" v-if="totalQuestions > 0">
            Step {{ currentQuestionNumber }} of {{ totalQuestions }}
          </p>
          <div v-else class="text-center text-red-500">No questions available in this form.</div>
        </div>

        <!-- Content Area -->
        <div class="flex-grow overflow-y-auto">
          <div v-if="isFollowUpQuestion">
            <div v-if="isLoading" class="text-center text-gray-600">Loading form...</div>
            <form v-else @submit.prevent="submitAnswers">
              Follow-up
              <FormField
                :label="followUpQuestion.questionText"
                v-model="currentFollowUpAnswer"
                :required="true"
              />
            </form>
          </div>
          <div v-else>
            <div v-if="isLoading" class="text-center text-gray-600">Loading form...</div>
            <form v-else @submit.prevent="submitAnswers">
              <div v-if="currentQuestion">
                <h2 class="text-lg font-semibold mb-4">{{ currentSection.section_name }}</h2>
                <FormField
                  v-if="currentQuestion.answerType === 'text'"
                  :label="currentQuestion.questionText"
                  v-model="answers[currentSectionIndex][currentQuestionIndex]"
                  :required="true"
                />
                <RadioGroup
                  v-if="currentQuestion.answerType === 'radio'"
                  :label="currentQuestion.questionText"
                  :options="currentQuestion.options"
                  v-model="answers[currentSectionIndex][currentQuestionIndex]"
                  :required="true"
                />
                <CheckboxGroup
                  v-if="currentQuestion.answerType === 'checkbox'"
                  :label="currentQuestion.questionText"
                  :options="currentQuestion.options"
                  v-model="answers[currentSectionIndex][currentQuestionIndex]"
                  :required="true"
                />
                <FileUpload
                  v-if="currentQuestion.answerType === 'file'"
                  :label="currentQuestion.questionText"
                  v-model="answers[currentSectionIndex][currentQuestionIndex]"
                  :required="true"
                />
              </div>
              <div v-else class="text-center text-gray-500">No question to display.</div>
            </form>
          </div>
        </div>

        <div class="mt-4 flex justify-between">
          <button
            v-if="!isLastQuestion"
            type="button"
            class="bg-blue-500 px-4 py-2 rounded-lg text-white"
            @click="goNext"
          >
            Next
          </button>
          <button
            v-else
            @click="handleSubmit"
            :class="{
              'bg-purple-600': !isSubmitting,
              'bg-gray-400 cursor-not-allowed': isSubmitting,
            }"
            class="px-4 py-2 rounded-lg text-white font-bold shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Submit</span>
            <span v-else>Submitting...</span>
          </button>
        </div>
    </div>
    <div v-else class="max-w-md w-full p-6 bg-white rounded-lg shadow-md flex flex-col justify-between text-center">
        <iframe src="https://lottie.host/embed/9fafd4f9-da30-46ae-b0ac-bc1276468c66/klvVXkvMkq.lottie"
        class="w-full h-64 mb-4"></iframe>
        <h2 class="text-2xl font-bold mb-4">Thank You!</h2>
        <p class="text-gray-600 mb-4">Your form has been submitted successfully.</p>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import FormField from "~/components/FormField.vue";
import RadioGroup from "~/components/RadioGroup.vue";
import CheckboxGroup from "~/components/CheckboxGroup.vue";
import FileUpload from "~/components/FileUpload.vue";

const form = ref({ title: "", sections: [] });
const answers = ref([]);
const isLoading = ref(true);
const currentSectionIndex = ref(0);
const currentQuestionIndex = ref(0);
const isThankYouPageVisible = ref(false);
const isSubmitting = ref(false);

// Follow-up question state
const isFollowUpQuestion = ref(false);
const followUpQuestion = ref({});
const followUpAnswers = ref([]);
const currentFollowUpAnswer = ref("");

// track section completion
const completedSections = ref(new Set());

const currentSection = computed(() => {
  return form.value.sections[currentSectionIndex.value] || null;
});

const currentQuestion = computed(() => {
  if (!currentSection.value?.questions) return null;
  return currentSection.value.questions[currentQuestionIndex.value];
});

const totalQuestions = computed(() => {
  return form.value.sections.reduce((total, section) => total + section.questions.length, 0);
});

const currentQuestionNumber = computed(() => {
  let questionCount = 0;
  for (let i = 0; i < currentSectionIndex.value; i++) {
    questionCount += form.value.sections[i].questions.length;
  }
  return questionCount + currentQuestionIndex.value + 1;
});

const isLastQuestion = computed(() => {
  return (
    currentSectionIndex.value === form.value.sections.length - 1 &&
    currentQuestionIndex.value === currentSection.value?.questions.length - 1 &&
    !isFollowUpQuestion.value
  );
});

const allQuestionIds = computed(() => {
  return form.value.sections.flatMap(section => 
    section.questions.map(q => q._id)
  );
});

const flattenedAnswers = computed(() => {
  return answers.value.flat();
});

onMounted(async () => {
  const { id } = useRoute().params;

  try {
    const formData = await $fetch(`/api/forms/${id}`);
    if (!formData.sections || !Array.isArray(formData.sections)) {
      throw new Error("Invalid form structure: 'sections' is missing or not an array.");
    }
    form.value = formData;
    // Initialize answers array for each section
    answers.value = formData.sections.map(section =>
      section.questions.map(q => q.answerType === "checkbox" ? [] : "")
    );
  } catch (error) {
    console.error("Error fetching form data:", error);
    alert("Failed to load the form. Please try again later.");
  } finally {
    isLoading.value = false;
  }
});

async function goNext() {
  if (!isFollowUpQuestion.value && 
      currentSection.value?.useAI && 
      !completedSections.value.has(currentSection.value._id) &&
      isLastQuestionInSection()) {
    
    isFollowUpQuestion.value = true;
    isLoading.value = true;

    const sectionQA = currentSection.value.questions.map((q, index) => ({
      questionId: q._id,
      question_text: q.questionText,
      answerType: q.answerType,
      options: q.options || [],
      answer: answers.value[currentSectionIndex.value][index]
    }));

    const response = await $fetch("/api/star-ai/follow_up_group", {
      method: "POST",
      body: sectionQA,
      params: {
        lang: "TH"
        // pass as TH | TODO: dynamic to user or ...
      }
    });

    isLoading.value = false;
    followUpQuestion.value = {
      questionText: response.response.content,
      answerType: "text",
      options: [],
      useAI: false,
    };

    // Mark section as completed
    completedSections.value.add(currentSection.value._id);
  } else if (isFollowUpQuestion.value) {
    followUpAnswers.value.push({
      fromSectionId: currentSection.value._id,
      generatedQuestion: followUpQuestion.value,
      answer: currentFollowUpAnswer.value,
    });
    isFollowUpQuestion.value = false;
    currentFollowUpAnswer.value = "";
    moveToNextQuestion();
  } else {
    moveToNextQuestion();
  }
}

function moveToNextQuestion() {
  if (currentQuestionIndex.value < currentSection.value.questions.length - 1) {
    currentQuestionIndex.value++;
  } else if (currentSectionIndex.value < form.value.sections.length - 1) {
    currentSectionIndex.value++;
    currentQuestionIndex.value = 0;
  }
}

function isLastQuestionInSection() {
  return currentQuestionIndex.value === currentSection.value.questions.length - 1;
}

async function submitAnswers() {
  try {
    const questionIds = allQuestionIds.value;
    const structuredAnswers = questionIds.map((questionId, index) => ({
      questionId,
      answer: flattenedAnswers.value[index],
    }));
    
    await $fetch("/api/answers", {
      method: "POST",
      body: {
        formId: form.value._id,
        answers: structuredAnswers,
        questionIds: questionIds,
        followUpAnswers: followUpAnswers.value,
      },
    });
    isThankYouPageVisible.value = true;
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to submit form. Please try again.");
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await submitAnswers();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to submit form. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>