import {get, set, entries, del} from "../_snowpack/pkg/idb-keyval.js";
import {editor, languages} from "../_snowpack/pkg/monaco-editor.js";
import {nanoid} from "../_snowpack/pkg/nanoid.js";
import {getIconForFile, getIconForFolder, getIconForOpenFolder} from "../_snowpack/pkg/vscode-icons-js.js";
import {menu, path, removeMenus} from "./util.js";
import "../index.css";
const nav = document.querySelector("nav");
const monaco = editor.create(document.getElementById("editor"), {
  theme: "vs-dark",
  value: "Welcome to 5de!"
});
let currentFileOpen = "";
monaco.getModel()?.onDidChangeContent(async (event) => {
  if (!event.isFlush && currentFileOpen) {
    if (currentFileOpen.includes(sep)) {
      const goesTo = currentFileOpen.split(sep);
      const top = goesTo.shift();
      const folder2 = await get(top);
      const name = goesTo.pop();
      let currentFolder = folder2;
      for (const folderinFolder of goesTo) {
        currentFolder = currentFolder[folderinFolder];
      }
      currentFolder[name] = new Blob([monaco.getValue()]);
      set(top, folder2);
    } else {
      set(currentFileOpen, new Blob([monaco.getValue()]));
    }
  }
});
const sep = nanoid(100);
function folder(name, value, parent = nav) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const img = new Image(20, 20);
  img.src = "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/" + getIconForFolder(name);
  summary.addEventListener("click", () => {
    img.src = "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/" + (!details.open ? getIconForOpenFolder(name) : getIconForFolder(name));
  });
  summary.append(img, new Text(name));
  summary.addEventListener("contextmenu", (event) => {
    console.log(path(details));
    if (currentFileOpen.startsWith(path(details, sep)))
      currentFileOpen = "";
    removeMenus();
    event.preventDefault();
    menu(event.clientX, event.clientY, [
      {
        name: "\u274C Delete",
        async click() {
          if (details.parentElement === nav) {
            del(name);
            return details.remove();
          }
          const pathTo = path(details, sep);
          const goesTo = pathTo.split(sep);
          const top = goesTo.shift();
          const folder2 = await get(top);
          goesTo.pop();
          let currentFolder = folder2;
          for (const folderinFolder of goesTo) {
            currentFolder = currentFolder[folderinFolder];
          }
          delete currentFolder[name];
          set(top, folder2);
          details.remove();
        }
      }
    ]);
  });
  details.append(summary);
  parent.appendChild(details);
  if (!value)
    return;
  for (const [name2, fileOrFolder] of Object.entries(value)) {
    if (fileOrFolder instanceof Blob) {
      file(name2, fileOrFolder, details);
    } else
      folder(name2, fileOrFolder, details);
  }
}
function file(name, value, parent = nav) {
  const btn = document.createElement("button");
  const img = new Image(20, 20);
  img.src = "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/" + getIconForFile(name);
  btn.append(img, new Text(name));
  parent.append(btn);
  btn.addEventListener("click", async () => {
    currentFileOpen = path(btn, sep);
    monaco.setValue(await value.text());
    const thelang = languages.getLanguages().find((lanugage) => lanugage.filenames?.some((fname) => fname === name) || lanugage.extensions?.some((ext) => name.endsWith(ext)) || lanugage.mimetypes?.some((mime) => value.type === mime))?.id || "plaintext";
    editor.setModelLanguage(monaco.getModel(), thelang);
  });
  btn.addEventListener("contextmenu", (event) => {
    removeMenus();
    event.preventDefault();
    menu(event.clientX, event.clientY, [
      {
        name: "\u274C Delete",
        async click() {
          if (currentFileOpen.startsWith(path(btn, sep)))
            currentFileOpen = "";
          if (btn.parentElement === nav) {
            del(name);
            return btn.remove();
          }
          const pathTo = path(btn, sep);
          const goesTo = pathTo.split(sep);
          const top = goesTo.shift();
          const folder2 = await get(top);
          goesTo.pop();
          let currentFolder = folder2;
          for (const folderinFolder of goesTo) {
            currentFolder = currentFolder[folderinFolder];
          }
          delete currentFolder[name];
          set(top, folder2);
          btn.remove();
        }
      }
    ]);
  });
}
nav.addEventListener("click", removeMenus);
async function load() {
  for (const [name, value] of await entries()) {
    if (typeof name !== "string")
      continue;
    if (value instanceof Blob) {
      file(name, value);
    } else {
      folder(name, value);
    }
  }
}
console.log(set, get);
load().catch(console.error);
document.getElementById("add")?.addEventListener("click", async () => {
  const name = prompt("Name of the file");
  if (name) {
    if (!await get(name)) {
      const blob = new Blob([""]);
      set(name, blob);
      file(name, blob);
    } else {
      alert("File already exists!");
    }
  }
});
