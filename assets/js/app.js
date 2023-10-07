import { LiveSocket } from "phoenix_live_view";
import { Socket } from "phoenix";
import { StoryHook } from "./lib/story_hook";
import { SearchHook } from "./lib/search_hook";
import { SidebarHook } from "./lib/sidebar_hook";

if (window.storybook === undefined) {
  console.warn("No storybook configuration detected.");
  console.warn(
    "If you need to use custom hooks or uploaders, please define them in JS file and declare this \
    file in your Elixir backend module options (:js_path key)."
  );
  window.storybook = {};
}

const colorModeHook = {
  mounted() {
    if (!localStorage.lsb_theme) return
    const colorMode = localStorage.getItem("lsb_theme")
    this.pushEvent("lsb:color-mode", { "color-mode": colorMode })
  },
};

function toggleColorMode(){
  const htmlClass = document.documentElement.classList.contains('lsb-dark')
  if(localStorage.lsb_theme == 'dark' && !htmlClass) document.documentElement.classList.add('lsb-dark')
  else if(localStorage.lsb_theme == 'light' && htmlClass) document.documentElement.classList.remove('lsb-dark')
}

window.addEventListener("lsb:toggle-darkmode", () => {
  if(localStorage.lsb_theme == 'light') localStorage.lsb_theme = 'dark';
  else localStorage.lsb_theme = 'light';
  toggleColorMode();
})

toggleColorMode();

let socketPath =
  document.querySelector("html").getAttribute("phx-socket") || "/live";

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");

let liveSocket = new LiveSocket(socketPath, Socket, {
  hooks: { ...window.storybook.Hooks, StoryHook, SearchHook, SidebarHook, colorModeHook },
  uploaders: window.storybook.Uploaders,
  params: (liveViewName) => {
    return {
      _csrf_token: csrfToken,
      extra: window.storybook.Params,
    };
  },
  ...window.storybook.LiveSocketOptions
});

liveSocket.connect();
window.liveSocket = liveSocket;
