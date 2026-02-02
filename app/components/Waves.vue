<template>
  <section class="absolute inset-0 -z-10 overflow-hidden">
    <div class="wave absolute">
      <span />
      <span />
      <span />
    </div>
  </section>
</template>

<style scoped>
section .wave {
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
  transition: 0.5s;
}

section .wave span {
  content: "";
  position: absolute;
  width: 325vh;
  height: 325vh;
  top: 0;
  left: 50%;
  transform: translate(-50%, -75%);
}

.content {
  position: relative;
  z-index: 1;
  font-size: 4em;
  letter-spacing: 2px;
  color: #fff;
}

section .wave span:nth-child(1) {
  border-radius: 45%;
  background: rgba(20, 20, 20, 1);
  animation: animate 10s linear infinite;
}

section .wave span:nth-child(2) {
  border-radius: 40%;
  background: rgba(20, 20, 20, 0.5);
  animation: animate 20s linear infinite;
}

section .wave span:nth-child(3) {
  border-radius: 42.5%;
  background: rgba(20, 20, 20, 0.5);
  animation: animate 30s linear infinite;
}

@keyframes animate {
  0% {
    transform: translate(-50%, -75%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -75%) rotate(360deg);
  }
}
</style>
