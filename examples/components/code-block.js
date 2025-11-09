/**
 * Code Block Component
 * Displays syntax-highlighted code with copy functionality
 */

export function createCodeBlock(code, title = 'Code', language = 'javascript') {
  const escapedCode = escapeHtml(code.trim());
  const id = `code-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-title">${title}</span>
        <button class="copy-button" onclick="copyCode('${id}')">Copy</button>
      </div>
      <pre id="${id}"><code class="language-${language}">${escapedCode}</code></pre>
    </div>
  `;
}

export function createAnnotatedCode(code, annotations) {
  const lines = code.trim().split('\n');
  const annotatedLines = lines.map((line, index) => {
    const annotation = annotations[index];
    if (annotation) {
      return `${line}  <span class="code-annotation">// ${annotation}</span>`;
    }
    return line;
  });

  return createCodeBlock(annotatedLines.join('\n'));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Global copy function (attached to window)
window.copyCode = function(id) {
  const codeBlock = document.getElementById(id);
  const code = codeBlock.textContent;

  navigator.clipboard.writeText(code).then(() => {
    const button = codeBlock.parentElement.querySelector('.copy-button');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
};
