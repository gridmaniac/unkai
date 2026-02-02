// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    // Configure Vue self-closing to be compatible with Prettier
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always", // Allow self-closing void elements like <input/>
          normal: "always",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
    // Allow single-word component names
    "vue/multi-word-component-names": "off",
    // Allow duplicate keys (useful for props/computed with same name)
    "vue/no-dupe-keys": "off",
  },
}).append({
  // Add prettier config to disable conflicting rules
  name: "prettier-compatibility",
  rules: {
    // Disable other formatting rules that conflict with Prettier
    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/multiline-html-element-content-newline": "off",
    "vue/html-indent": "off",
    "vue/html-closing-bracket-newline": "off",
    "vue/html-closing-bracket-spacing": "off",
  },
});
