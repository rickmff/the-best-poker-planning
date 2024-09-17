<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Set Your Name</h2>
        <form @submit.prevent="submitName">
          <input
            v-model="name"
            type="text"
            placeholder="Enter your name"
            class="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <button
            type="submit"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const emit = defineEmits<{
    (e: 'nameSet', name: string): void
  }>();
  
  const name = ref('');
  
  const submitName = () => {
    if (name.value.trim()) {
      emit('nameSet', name.value.trim());
    }
  };
  </script>