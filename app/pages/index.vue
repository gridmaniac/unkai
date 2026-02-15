<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
const input = ref("");
const textareaRef = useTemplateRef("textarea");
const token = useCookie("token");

const chat = new Chat({
  onFinish() {
    containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
  },
});

const handleSubmit = (e: Event) => {
  e.preventDefault();

  if (input.value.includes("login")) {
    token.value = input.value.split(" ")[1];
    input.value = "";
    return;
  }

  if (input.value.includes("logout")) {
    token.value = "";
    input.value = "";
    return;
  }

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
        containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
      });
    }
  },
);

const containerEl = useTemplateRef("container");
watch(
  () => chat.messages,
  () => {
    nextTick(() => {
      containerEl.value?.scrollTo({ top: containerEl.value?.scrollHeight });
    });
  },
);

const { language } = useNavigatorLanguage();
const localStrings = ref({
  name: "Anton",
  message: "Hey, it's Anton. What do you want to know?",
  placeholder: "Ask me anything",
  disclaimer: `For your privacy, this chat
      <a
        class="link"
        href="https://github.com/gridmaniac/unkai"
        target="_blank"
        >isn’t saved anywhere</a
      >.`,
  noMessage: "There was a message here. It's gone now...",
  topProjects: "TOP 5 Projects",
  topProjectsMsg: "Show top 5 projects you worked on",
});

onMounted(() => {
  if (language.value?.indexOf("ru") !== -1) {
    localStrings.value = {
      name: "Антон",
      message: "Привет. Это Антон, что хочешь узнать?",
      placeholder: "Задать вопрос",
      disclaimer: `С целью вашей анонимности, данный чат
        <a
          class="link"
          href="https://github.com/gridmaniac/unkai"
          target="_blank"
          >нигде</a
        >
        не сохраняется.`,
      noMessage: "Здесь было сообщение. Теперь его нет...",
      topProjects: "ТОП 5 Проектов",
      topProjectsMsg: "Покажи топ 5 проектов, над которыми работал",
    };
  }
});
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="flex w-full max-w-3xl flex-col p-5">
      <div ref="container" class="max-h-[50dvh] overflow-y-auto">
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://avatars.githubusercontent.com/u/25141263?v=4" />
            </div>
          </div>
          <div class="chat-header">{{ localStrings.name }}</div>
          <div class="chat-bubble">{{ localStrings.message }}</div>
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
            <div class="chat-header">{{ localStrings.name }}</div>
            <div class="chat-bubble">
              <div
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${part.type}-${index}`"
              >
                <MDC
                  v-if="part.type === 'text'"
                  :value="part.text"
                  :cache-key="`${message.id}-${part.type}-${index}`"
                />

                <Projects
                  v-if="
                    i === chat.messages.length - 1 &&
                    part.type === 'tool-portfolio'
                  "
                  :items="part.output as Project[]"
                />
                <div
                  v-if="
                    i !== chat.messages.length - 1 &&
                    part.type === 'tool-portfolio'
                  "
                  class="text-sm text-gray-500"
                >
                  There was a message here. It's gone now...
                </div>
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

        <div v-if="chat.status === 'submitted'" class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img src="https://avatars.githubusercontent.com/u/25141263?v=4" />
            </div>
          </div>
          <div class="chat-header">{{ localStrings.name }}</div>
          <div class="chat-bubble">
            <span class="loading loading-dots loading-sm" />
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-row-reverse gap-2">
        <button
          class="btn btn-primary btn-soft btn-sm"
          :disabled="chat.status !== 'ready'"
          @click="chat.sendMessage({ text: localStrings.topProjectsMsg })"
        >
          {{ localStrings.topProjects }}
        </button>
      </div>

      <div class="divider my-1" />

      <label class="textarea textarea-lg flex w-full items-center gap-2">
        <textarea
          ref="textarea"
          v-model.trim="input"
          class="grow"
          rows="2"
          :disabled="chat.status !== 'ready'"
          :placeholder="localStrings.placeholder"
          @keydown.enter="handleSubmit"
        />
        <button
          class="btn btn-md btn-circle btn-neutral"
          :disabled="chat.status !== 'ready'"
          @click="handleSubmit"
        >
          <IconSent class="size-6" />
        </button>
      </label>
      <div
        class="mt-2 text-xs text-gray-500"
        v-html="localStrings.disclaimer"
      />
    </div>
  </div>
</template>
