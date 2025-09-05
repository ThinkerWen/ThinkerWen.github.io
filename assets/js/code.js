document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const button = document.createElement("button");
    button.innerText = "复制";
    button.className = "copy-button";

    const pre = codeBlock.parentNode;
    pre.style.position = "relative";
    pre.appendChild(button);

    button.addEventListener("click", () => {
      const raw = codeBlock.innerText;
      const filtered = raw.split("\n").filter(line => line.trim() !== "").join("\n");
      navigator.clipboard.writeText(filtered).then(() => {
        button.innerText = "已复制!";
        setTimeout(() => {
          button.innerText = "复制";
        }, 1500);
      }).catch(err => {
        console.error("复制失败:", err);
      });
    });
  });
});

