self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service worker active");
});

self.addEventListener("fetch", (event) => {
  // basic pass-through for now
});
