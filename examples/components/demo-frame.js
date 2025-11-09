/**
 * Demo Frame Component
 * Interactive demonstration container
 */

export function createDemoFrame(title = 'Live Demo', setupFn) {
  const demoId = `demo-${Math.random().toString(36).substr(2, 9)}`;

  const html = `
    <div class="demo-frame">
      <div class="demo-header">
        <span class="demo-title">${title}</span>
        <button class="reset-button" onclick="resetDemo('${demoId}')">Reset</button>
      </div>
      <div id="${demoId}" class="demo-content">
        <!-- Demo content inserted here -->
      </div>
      <div id="${demoId}-output" class="demo-output">
        Console output appears here...
      </div>
    </div>
  `;

  // Store setup function for reset
  if (!window.__demoSetupFunctions) {
    window.__demoSetupFunctions = {};
  }
  window.__demoSetupFunctions[demoId] = setupFn;

  return { html, demoId };
}

// Global reset function
window.resetDemo = function(demoId) {
  const setupFn = window.__demoSetupFunctions?.[demoId];
  if (setupFn) {
    const container = document.getElementById(demoId);
    const output = document.getElementById(`${demoId}-output`);
    container.innerHTML = '';
    if (output) output.textContent = 'Console output appears here...';
    setupFn(container, output);
  }
};

/**
 * Logger helper for demo output
 */
export function createLogger(outputElement) {
  return {
    log: (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      const current = outputElement.textContent;
      const newContent = current === 'Console output appears here...'
        ? message
        : current + '\n' + message;

      outputElement.textContent = newContent;
      outputElement.scrollTop = outputElement.scrollHeight;
    },
    clear: () => {
      outputElement.textContent = 'Console output appears here...';
    }
  };
}
