import dottie from "../snowpack/pkg/dottie.js";
import {unzip} from "../snowpack/pkg/fflate.js";
import {languages} from "../snowpack/pkg/monaco-editor.js";
import {del, get, set} from "../snowpack/pkg/idb-keyval.js";
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
  menu2.style.left = `${x}px`;
  menu2.style.top = `${y}px`;
  menu2.addEventListener("click", removeMenus);
  for (const option of options) {
    const btn = document.createElement("button");
    btn.innerText = option.name;
    btn.addEventListener("click", option.click);
    menu2.append(btn);
  }
}
export const languageOf = (filename, value) => languages.getLanguages().find((lanugage) => lanugage.filenames?.some((fname) => fname === filename) || lanugage.extensions?.some((ext) => filename.endsWith(ext)) || lanugage.mimetypes?.some((mime) => value.type === mime))?.id || "plaintext";
export async function zipToFolder(zip) {
  return new Promise(async (resolve, reject) => {
    unzip(new Uint8Array(await zip.arrayBuffer()), async (err, jszip) => {
      if (err)
        reject(err);
      const fs = dottie.transform(Object.fromEntries(Object.entries(jszip).map(([name, value]) => [name, new Blob([value])])), {delimiter: "/"});
      resolve(fs);
    });
  });
}
export const deleteOption = (name, details, sep) => ({
  name: "\u274C Delete",
  async click() {
    if (details.parentElement === nav) {
      del(name);
      return details.remove();
    }
    const pathTo = path(details, sep);
    const goesTo = pathTo.split(sep);
    const top = goesTo.shift();
    const folder = await get(top);
    goesTo.pop();
    let currentFolder = folder;
    for (const folderinFolder of goesTo) {
      currentFolder = currentFolder[folderinFolder];
    }
    delete currentFolder[name];
    set(top, folder);
    details.remove();
  }
});
export const renameOption = (name, details, sep) => ({
  name: "\u{1F4DB} Rename",
  async click() {
    const newName = prompt("What should the new name be?");
    if (!newName)
      return;
    if (details.parentElement === nav) {
      set(newName, await get(name));
      del(name);
      return location.reload();
    }
    const pathTo = path(details, sep);
    const goesTo = pathTo.split(sep);
    const top = goesTo.shift();
    const folder = await get(top);
    goesTo.pop();
    let currentFolder = folder;
    for (const folderinFolder of goesTo) {
      currentFolder = currentFolder[folderinFolder];
    }
    const blob = currentFolder[name];
    delete currentFolder[name];
    currentFolder[newName] = blob;
    set(top, folder);
    location.reload();
  }
});
