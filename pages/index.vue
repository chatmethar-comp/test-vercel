<template>
  <Navbar />
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Star Survey Dashboard</h1>

    <!-- Button to Create a New Form -->
    <div class="mb-6">
      <button
        @click="goToCreateForm"
        class="px-4 py-2 bg-star-primary-red-300 text-white rounded-md hover:bg-primary-dark"
      >
        + Create New Form
      </button>
    </div>

    <h2 class="text-lg font-semibold mb-4">Your Forms</h2>
    <div v-if="forms.length === 0" class="text-gray-500">
      No forms created yet. Click "Create New Form" to get started.
    </div>
    <div v-else>
      <v-row>
        <v-col cols="12" md="6" lg="4"
          v-for="form in forms"
          :key="form._id"
        >
          <v-card
            variant="flat"
            class="border-thin"
            >
            <v-img
              height="200px"
              src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
              cover
            ></v-img>
            <v-card-title>{{ form.title }}</v-card-title>
            <v-card-text>
              <div>{{ getTotalQuestions(form) }} questions</div>
              <div class="text-gray-500">{{ form.sections.length }} sections</div>
              <div class="text-gray-500">{{ form.responseCount }} responses</div>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="viewAnswers(form._id)">Response</v-btn>
              <v-btn 
                @click="editForm(form._id)"
                variant="outlined"
                >
                Edit
              </v-btn>
              <v-btn
                @click="viewForm(form._id)"
                variant="outlined"
                >
                View
              </v-btn>
              <v-btn 
                @click="copyLink(form._id)"
                variant="outlined"
                >
                Share
              </v-btn>
              <v-btn 
                @click="deleteForm(form._id)" 
                variant="outlined" 
                color="#ff0000" 
                >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "~/components/Navbar.vue";
import { useAuthStore } from "~/stores/auth";
import whitelist from '~/config/whitelist.json';
import { isAdmin } from '~/server/utils/utils';

definePageMeta({
  middleware: ['auth'],
});

const router = useRouter();
const forms = ref([]);
const authStore = useAuthStore();

// Helper function to count total questions across all sections
function getTotalQuestions(form) {
  return form.sections.reduce((total, section) => total + section.questions.length, 0);
}

// Fetch all forms created by the user
onMounted(async () => {
  try {
    const userId = authStore.user.value !== null ? authStore.user.value.id : "";
    const query = isAdmin() ? {} : { creator: userId };

    const formsData = await $fetch("/api/forms", { query });
    for (const form of formsData) {
      form.responseCount = await getResponseCount(form._id);
    }
    forms.value = formsData;
  } catch (error) {
    console.error("Failed to load forms:", error);
  }
});

// Fetch the response count for a form
async function getResponseCount(formId) {
  try {
    // TODO: optimize to not call every form api to get just length
    // https://www.mongodb.com/docs/manual/reference/method/db.collection.count/
    //db.collection.count()
    const answers = await $fetch(`/api/forms/${formId}/answers`);
    return answers.length;
  } catch (error) {
    console.error(`Failed to load responses for form ${formId}:`, error);
    return 0;
  }
}

// Navigate to the create form page
function goToCreateForm() {
  router.push("/create-form");
}

// Navigate to the edit form page
function editForm(id) {
  router.push(`/edit-form/${id}`);
}

// View form as it would appear to a user
function viewForm(id) {
  window.open(`/form/${id}`, '_blank');
  // router.push(`/form/${id}`);
}

function viewAnswers(formId) {
  router.push(`/form/${formId}/answers`);
}

// Copy the shareable link to the clipboard
async function copyLink(id) {
  const link = `${window.location.origin}/form/${id}`;
  try {
    await navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy link:", err);
    alert("Failed to copy link.");
  }
}

async function deleteForm(formId) {
  if (!confirm("Are you sure you want to delete this form?")) return;

  try {
    await $fetch(`/api/forms/${formId}`, {
      method: "DELETE",
    });
    forms.value = forms.value.filter((form) => form._id !== formId);
    alert("Form deleted successfully!");
  } catch (error) {
    console.error("Error deleting form:", error.message);
    alert("Failed to delete form.");
  }
}
</script>

<style>
/* Optional: Custom styling */
</style>
