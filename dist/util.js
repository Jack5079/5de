import {languages} from "../snowpack/pkg/monaco-editor.js";
export const nav = document.querySelector("nav");
export function path(ele, sep = "/") {
  if (ele.parentNode === nav)
    return ele.innerText;
  function getPath(details, previous = "") {
    if (details.parentNode === nav)
      return details.querySelector("summary")?.innerText + sep + previous;
    return getPath(details.parentNode, details.querySelector("summary")?.innerText + sep + previous);
  }
  return getPath(ele.parentNode) + ele.innerText;
}
export const removeMenus = () => document.querySelectorAll("menu").forEach((ele) => ele.remove());
export function menu(x, y, options) {
  const menu2 = document.createElement("menu");
  document.body.append(menu2);
  menu2.style.left = x + "px";
  menu2.style.top = y + "px";
  menu2.addEventListener("click", removeMenus);
  for (const option of options) {
    const btn = document.createElement("button");
    btn.innerText = option.name;
    btn.addEventListener("click", option.click);
    menu2.append(btn);
  }
}
export const languageOf = (filename, value) => languages.getLanguages().find((lanugage) => lanugage.filenames?.some((fname) => fname === filename) || lanugage.extensions?.some((ext) => filename.endsWith(ext)) || lanugage.mimetypes?.some((mime) => value.type === mime))?.id || "plaintext";
