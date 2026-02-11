<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
const input = ref("");
const textareaRef = useTemplateRef("textarea");
const chat = new Chat({
  onFinish() {
    containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
  },
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = "";
};

let timeout: NodeJS.Timeout;

watch(
  () => chat.status,
  () => {
    if (chat.status === "streaming") {
      timeout = setInterval(() => {
        containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
      }, 100);
    } else {
      clearInterval(timeout);
      nextTick(() => {
        textareaRef.value?.focus();
      });
    }
    // console.log("what");
  },
);

watch(
  () => chat.messages,
  () => {
    nextTick(() => {
      containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
    });
  },
);

const text = ref("");
const isThinking = ref(false);
const containerEl = useTemplateRef("container");

const messages = ref([
  {
    me: false,
    text: "Привет. Это Антон, что хочешь узнать?",
  },
]);

const streamText = ref("");

async function sendMessage() {
  const prompt = text.value;
  const context = messages.value.reduce((acc, x) => {
    acc += (x.me ? "User: " : "Антон: ") + x.text + `\r\n`;
    return acc;
  }, "");

  messages.value.push({ me: true, text: text.value });

  text.value = "";
  streamText.value = "";
  isThinking.value = true;

  const res = await fetch("/api/prompt", {
    method: "POST",
    body: JSON.stringify({ prompt, context }),
    headers: { "Content-Type": "application/json" },
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    streamText.value += decoder.decode(value);
    containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
  }

  isThinking.value = false;
  messages.value.push({ me: false, text: streamText.value });
}
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <!-- <NuxtLink to="/memories" class="btn btn-accent">To Memories</NuxtLink> -->

    <!-- <div>
      <div v-for="(m, index) in chat.messages" :key="m.id ? m.id : index">
        {{ m.role === "user" ? "User: " : "AI: " }}
        <div
          v-for="(part, index) in m.parts"
          :key="`${m.id}-${part.type}-${index}`"
        >
          <div v-if="part.type === 'text'">{{ part.text }}</div>
        </div>
      </div>

      <form @submit="handleSubmit">
        <input v-model="input" placeholder="Say something..." />
      </form>
    </div> -->

    <div class="flex w-full max-w-xl flex-col p-5">
      <div ref="container" class="max-h-[50dvh] overflow-y-auto">
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://avatars.githubusercontent.com/u/25141263?v=4" />
            </div>
          </div>
          <div class="chat-header">Антон</div>
          <div class="chat-bubble">Привет. Это Антон, что хочешь узнать?</div>
        </div>

        <template v-for="(message, i) in chat.messages" :key="i">
          <div v-if="message.role !== 'user'" class="chat chat-start">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <img
                  src="https://avatars.githubusercontent.com/u/25141263?v=4"
                />
              </div>
            </div>
            <div class="chat-header">Антон</div>
            <div class="chat-bubble">
              <div
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${part.type}-${index}`"
              >
                <div v-if="part.type === 'text'">{{ part.text }}</div>
              </div>
            </div>
          </div>
          <div v-else class="chat chat-end">
            <div class="chat-bubble chat-bubble-neutral">
              <div
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${part.type}-${index}`"
              >
                <div v-if="part.type === 'text'">{{ part.text }}</div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="isThinking && streamText" class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://avatars.githubusercontent.com/u/25141263?v=4" />
            </div>
          </div>
          <div class="chat-header">Антон</div>
          <div class="chat-bubble">{{ streamText }}</div>
        </div>

        <div v-if="chat.status === 'submitted'" class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://avatars.githubusercontent.com/u/25141263?v=4" />
            </div>
          </div>
          <div class="chat-header">Антон</div>
          <div class="chat-bubble">
            <span class="loading loading-dots loading-sm" />
          </div>
        </div>
      </div>

      <div class="divider" />

      <label class="textarea textarea-lg flex w-full items-center gap-2">
        <textarea
          ref="textarea"
          v-model.trim="input"
          class="grow"
          rows="2"
          :disabled="chat.status !== 'ready'"
          placeholder="Задать вопрос"
          @keydown.enter="handleSubmit"
        />
        <button
          class="btn btn-md btn-circle btn-neutral"
          :disabled="false"
          @click="handleSubmit"
        >
          <IconSent class="size-6" />
        </button>
      </label>
    </div>
  </div>
</template>
