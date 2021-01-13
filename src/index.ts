import { get, set, entries, del } from 'idb-keyval'
import { editor, languages } from 'monaco-editor'
import { nanoid } from 'nanoid'
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js'
import { Folder, menu, path, removeMenus } from './util'
import '/index.css'
const nav = document.querySelector('nav')!
const monaco = editor.create(document.getElementById('editor')!, {
  theme: 'vs-dark'
})

let currentFileOpen = ''
monaco.getModel()?.onDidChangeContent(async event => {
  if (!event.isFlush && currentFileOpen) {
    if (currentFileOpen.includes(sep)) {
      const goesTo = currentFileOpen.split(sep)
      const top = goesTo.shift()!
      const folder = await get(top)
      const name = goesTo.pop()!
      let currentFolder = folder
      for (const folderinFolder of goesTo) {
        currentFolder = currentFolder[folderinFolder]
      }
      currentFolder[name] = new Blob([monaco.getValue()])
      set(top, folder)
    } else {
      set(currentFileOpen, new Blob([monaco.getValue()]))
    }
  }
})
const sep = nanoid(100)
function folder (name: string, value: Folder, parent: HTMLElement = nav) {
  const details = document.createElement('details')
  const summary = document.createElement('summary')
  const img = new Image(20, 20)
  img.src = 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/' + getIconForFolder(name)
  summary.addEventListener('click', () => {
    img.src = 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/' + (!details.open ? getIconForOpenFolder(name) : getIconForFolder(name))
  })
  summary.append(img, new Text(name))
  summary.addEventListener('contextmenu', event => {
    console.log(path(details))
    if (currentFileOpen.startsWith(path(details, sep))) currentFileOpen = ''
    removeMenus()
    event.preventDefault()
    menu(event.clientX, event.clientY, [
      {
        name: '❌ Delete', async click () {
          if (details.parentElement === nav) {
            del(name)
            return details.remove()
          }
          const pathTo = path(details, sep)
          const goesTo = pathTo.split(sep)
          const top = goesTo.shift()!
          const folder = await get(top)
          goesTo.pop()
          let currentFolder = folder
          for (const folderinFolder of goesTo) {
            currentFolder = currentFolder[folderinFolder]
          }
          delete currentFolder[name]
          set(top, folder)
          details.remove()
        }
      }
    ])
  })
  details.append(summary)
  parent.appendChild(details)
  if (!value) return
  for (const [name, fileOrFolder] of Object.entries(value)) {
    if (fileOrFolder instanceof Blob) {
      file(name, fileOrFolder, details)
    } else folder(name, fileOrFolder, details)
  }
}


function file (name: string, value: Blob, parent: HTMLElement = nav) {
  // is a file
  const btn = document.createElement('button')
  const img = new Image(20, 20)
  img.src = 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/' + getIconForFile(name)
  btn.append(img, new Text(name))
  parent.append(btn)
  btn.addEventListener('click', async () => {
    currentFileOpen = path(btn, sep)
    monaco.setValue(await value.text())
    const thelang = languages.getLanguages().find(lanugage => (
      lanugage.filenames?.some(fname => fname === name)
      || lanugage.extensions?.some(ext => name.endsWith(ext))
      || lanugage.mimetypes?.some(mime => value.type === mime)
    ))?.id || 'plaintext'
    editor.setModelLanguage(monaco.getModel()!, thelang)
  })
  btn.addEventListener('contextmenu', event => {
    removeMenus()
    event.preventDefault()
    menu(event.clientX, event.clientY, [
      {
        name: '❌ Delete', async click () {
          if (currentFileOpen.startsWith(path(btn, sep))) currentFileOpen = ''
          if (btn.parentElement === nav) {
            del(name)
            return btn.remove()
          }
          const pathTo = path(btn, sep)
          const goesTo = pathTo.split(sep)
          const top = goesTo.shift()!
          const folder = await get(top)
          goesTo.pop()
          let currentFolder = folder
          for (const folderinFolder of goesTo) {
            currentFolder = currentFolder[folderinFolder]
          }
          delete currentFolder[name]
          set(top, folder)
          btn.remove()
        }
      }
    ])
  })
}

nav.addEventListener('click', removeMenus)

async function load () {
  for (const [name, value] of await entries()) {
    if (typeof name !== 'string') continue
    if (value instanceof Blob) {
      // is a file
      file(name, value)
    } else {
      // is a folder
      folder(name, value)
    }
  }
}

console.log(set, get)
load().catch(console.error)

document.getElementById('add')?.addEventListener('click', async () => {
  const name = prompt('Name of the file')
  if (name) {
    if (!await get(name)) {
      const blob = new Blob([''])
      set(name, blob)
      file(name, blob)
    } else {
      alert('File already exists!')
    }
  }
})