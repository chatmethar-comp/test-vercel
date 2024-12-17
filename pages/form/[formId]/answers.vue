<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Answers for Form: {{ formTitle }}</h1>
    <!-- Export Button -->
    <button @click="exportToExcel" class="bg-green-500 text-white px-4 py-2 rounded my-4">
      Export to Excel
    </button>
    <p class="text-gray-600 mb-8">Below are the responses submitted for this form:</p>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center text-gray-500">Loading answers...</div>

    <!-- No Answers State -->
    <div v-else-if="answers.length === 0" class="text-gray-500">
      No answers have been submitted yet.
    </div>

    <!-- Visualization and Table for Answers -->
    <div v-else>
      <!-- Visualization Section -->
      <div v-for="section in form.sections" :key="section._id" class="mb-8">
        <h2 class="text-xl font-bold mb-4">{{ section.section_name }}</h2>
        <div v-for="question in section.questions" :key="question._id" class="mb-4">
          <h3 class="font-semibold">{{ question.questionText }}</h3>
          <div v-if="question.answerType === 'text'" class="text-response bg-white p-4 rounded-lg shadow-md">
            <div v-for="(response, index) in getResponsesForQuestion(question._id)" :key="index" class="response-item">
              <p class="text-gray-700"><strong>Response {{ index + 1 }}:</strong> {{ response.option }} (Count: {{ response.count }})</p>
            </div>
          </div>
          <div v-else-if="question.answerType === 'radio'" class="chart-container bg-white p-4 rounded-lg shadow-md">
            <canvas :ref="setCanvasRef(question._id)"></canvas>
          </div>
          <div v-else-if="question.answerType === 'checkbox'" class="chart-container bg-white p-4 rounded-lg shadow-md">
            <canvas :ref="setCanvasRef(question._id)"></canvas>
          </div>
        </div>
      </div>

      <!-- Table for Answers Section -->
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-4 py-2 text-left">Submission #</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Submitted Time</th>
              <!-- Section Headers -->
              <template v-for="section in form.sections" :key="section._id">
                <th
                  v-for="question in section.questions"
                  :key="question._id"
                  class="border border-gray-300 px-4 py-2 text-left"
                >
                  <div class="text-xs text-gray-500">{{ section.section_name }}</div>
                  {{ question.questionText }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(answerSet, index) in answers"
              :key="answerSet._id"
              class="hover:bg-gray-50"
            >
              <td class="border border-gray-300 px-4 py-2">{{ index + 1 }}</td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatDate(answerSet.time) }}
              </td>
              <!-- Answers for each section's questions -->
              <template v-for="section in form.sections" :key="section._id">
                <td
                  v-for="question in section.questions"
                  :key="question._id"
                  class="border border-gray-300 px-4 py-2"
                >
                  <template v-if="findAnswer(answerSet.answers, question._id)">
                    <!-- Handle different answer types -->
                    <template v-if="question.answerType === 'checkbox'">
                      {{ formatCheckboxAnswer(findAnswer(answerSet.answers, question._id).answer) }}
                    </template>
                    <template v-else>
                      {{ findAnswer(answerSet.answers, question._id).answer }}
                    </template>
                  </template>
                  <template v-else>N/A</template>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Follow-up Answers Section -->
      <div v-if="hasFollowUpAnswers" class="mt-8">
        <h2 class="text-xl font-bold mb-4">Follow-up Answers</h2>
        <div v-for="(answerSet, index) in answers" :key="`followup-${answerSet._id}`" class="mb-6">
          <h3 class="font-semibold mb-2">Submission #{{ index + 1 }}</h3>
          <div v-if="answerSet.followUpAnswers && answerSet.followUpAnswers.length > 0">
            <div 
              v-for="followUp in answerSet.followUpAnswers" 
              :key="followUp._id"
              class="ml-4 mb-4 p-4 border rounded-lg"
            >
              <p>from <span class="font-medium">{{ findQuestionText(followUp.fromSectionId) }}</span></p>
              <p class="text-gray-600 mt-2">Follow-up: {{ followUp.generatedQuestion.questionText }}</p>
              <p class="mt-2">Answer: {{ followUp.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth'],
});
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Chart.register(...registerables);

const route = useRoute();
const formId = route.params.formId;

const answers = ref([]);
const form = ref({ title: "", sections: [] });
const formTitle = ref("");
const isLoading = ref(true);
const canvasRefs = ref({});

// Computed property to check if there are any follow-up answers
const hasFollowUpAnswers = computed(() => {
  return answers.value.some(answerSet => 
    answerSet.followUpAnswers && answerSet.followUpAnswers.length > 0
  );
});

// Fetch form and answers data
onMounted(async () => {
  try {
    // Fetch form details
    const formData = await $fetch(`/api/forms/${formId}`);
    form.value = formData;
    formTitle.value = formData.title;

    // Fetch answers for the form
    const answersData = await $fetch(`/api/forms/${formId}/answers`);
    answers.value = answersData;

    // Initialize charts after data is loaded
    nextTick(() => {
      form.value.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.answerType === 'radio') {
            const responses = getResponsesForQuestion(question._id);
            createPieChart(question._id, responses);
          } else if (question.answerType === 'checkbox') {
            const responses = getResponsesForQuestion(question._id);
            createBarChart(question._id, responses);
          }
        });
      });
    });
  } catch (error) {
    console.error("Failed to fetch answers or form data:", error);
  } finally {
    isLoading.value = false;
  }
});

function setCanvasRef(questionId) {
  return (el) => {
    if (el) {
      canvasRefs.value[questionId] = el;
    }
  };
}

function findAnswer(answerSet, questionId) {
  return answerSet.find((ans) => ans.questionId === questionId);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatCheckboxAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  return answer;
}

function findQuestionText(sectionId) {
  const target = form.value.sections.find(s => s._id === sectionId);
  if (target) {
    return target.section_name;
  }

  return "Question not found";
}

function getResponsesForQuestion(questionId) {
  const responses = [];
  answers.value.forEach(answerSet => {
    const answer = findAnswer(answerSet.answers, questionId);
    if (answer) {
      responses.push(answer.answer);
    }
  });

  // Count occurrences of each response for radio and checkbox questions
  const responseCounts = responses.reduce((acc, response) => {
    if (Array.isArray(response)) {
      response.forEach(res => {
        acc[res] = (acc[res] || 0) + 1;
      });
    } else {
      acc[response] = (acc[response] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.keys(responseCounts).map(option => ({
    option,
    count: responseCounts[option]
  }));
}

function createPieChart(questionId, responses) {
  nextTick(() => {
    const canvas = canvasRefs.value[questionId];
    if (!canvas) {
      console.error(`Canvas element for question ${questionId} not found.`);
      return;
    }
    const ctx = canvas.getContext('2d');
    const totalResponses = responses.reduce((sum, r) => sum + r.count, 0);
    const data = {
      labels: responses.map(r => r.option),
      datasets: [{
        data: responses.map(r => r.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      }]
    };
    const config = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Pie Chart'
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                const count = data.datasets[0].data[tooltipItem.dataIndex];
                const percentage = ((count / totalResponses) * 100).toFixed(2);
                return `${data.labels[tooltipItem.dataIndex]}: ${count} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
    new Chart(ctx, config);
  });
}

function createBarChart(questionId, responses) {
  nextTick(() => {
    const canvas = canvasRefs.value[questionId];
    if (!canvas) {
      console.error(`Canvas element for question ${questionId} not found.`);
      return;
    }
    const ctx = canvas.getContext('2d');
    const totalResponses = responses.reduce((sum, r) => sum + r.count, 0);
    const data = {
      labels: responses.map(r => r.option),
      datasets: [{
        data: responses.map(r => r.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      }]
    };
    const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Bar Chart'
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                const count = data.datasets[0].data[tooltipItem.dataIndex];
                const percentage = ((count / totalResponses) * 100).toFixed(2);
                return `${data.labels[tooltipItem.dataIndex]}: ${count} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
    new Chart(ctx, config);
  });
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // Export table data
  const tableData = [];
  tableData.push(["Submission #", "Submitted Time", ...form.value.sections.flatMap(section => section.questions.map(question => `${section.section_name} - ${question.questionText}`))]);
  answers.value.forEach((answerSet, index) => {
    const row = [index + 1, formatDate(answerSet.time)];
    form.value.sections.forEach(section => {
      section.questions.forEach(question => {
        const answer = findAnswer(answerSet.answers, question._id);
        if (answer) {
          row.push(question.answerType === 'checkbox' ? formatCheckboxAnswer(answer.answer) : answer.answer);
        } else {
          row.push("N/A");
        }
      });
    });
    tableData.push(row);
  });
  const wsTable = XLSX.utils.aoa_to_sheet(tableData);
  XLSX.utils.book_append_sheet(wb, wsTable, "Table Data");

  // Export follow-up answers
  const followUpData = [];
  followUpData.push(["Submission #", "From Section", "Follow-up Question", "Answer"]);
  answers.value.forEach((answerSet, index) => {
    if (answerSet.followUpAnswers && answerSet.followUpAnswers.length > 0) {
      answerSet.followUpAnswers.forEach(followUp => {
        followUpData.push([index + 1, findQuestionText(followUp.fromSectionId), followUp.generatedQuestion.questionText, followUp.answer]);
      });
    }
  });
  const wsFollowUp = XLSX.utils.aoa_to_sheet(followUpData);
  XLSX.utils.book_append_sheet(wb, wsFollowUp, "Follow-up Answers");

  // Save the workbook
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${formTitle.value}.xlsx`);
}
</script>

<style scoped>
.text-response {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.response-item {
  padding: 4px;
  border-bottom: 1px solid #ddd;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
