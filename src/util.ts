import dottie from 'dottie'
import { unzip } from 'fflate'
import type { unzipSync } from 'fflate'
import { languages } from 'monaco-editor'
import { del, get, set } from 'idb-keyval'

export const nav = document.querySelector('nav')!
export function path (ele: HTMLElement, sep = '/') {
  if (ele.parentNode === nav) return ele.innerText
  function getPath (details: Node & ParentNode, previous: string = ''): string {
    if (details.parentNode === nav) return details.querySelector('summary')?.innerText + sep + previous
    return getPath(details.parentNode!, details.querySelector('summary')?.innerText + sep + previous)
  }
  return getPath(ele.parentNode!) + ele.innerText
}
export interface Folder {
  [key: string]: Folder | Blob
}

export const removeMenus = () => document.querySelectorAll('menu').forEach(ele => ele.remove())
export function menu (x: number, y: number, options: ({
  name: string
  click (this: HTMLButtonElement, event: MouseEvent): any
})[]) {
  const menu = document.createElement('menu')
  document.body.append(menu)
  menu.style.left = `${x}px`
  menu.style.top = `${y}px`
  menu.addEventListener('click', removeMenus)
  for (const option of options) {
    const btn = document.createElement('button')
    btn.innerText = option.name
    btn.addEventListener('click', option.click)
    menu.append(btn)
  }
}

export const languageOf = (filename: string, value: Blob) => languages.getLanguages().find(lanugage => (
  lanugage.filenames?.some(fname => fname === filename)
  || lanugage.extensions?.some(ext => filename.endsWith(ext))
  || lanugage.mimetypes?.some(mime => value.type === mime)
))?.id || 'plaintext'

export async function zipToFolder (zip: Blob): Promise<Folder> {
  const jszip = await new Promise<ReturnType<typeof unzipSync>>(async (resolve, reject) => unzip(new Uint8Array(await zip.arrayBuffer()), (err, file) => err ? reject(err) : resolve(file)))
  const fs: Folder = dottie.transform(
    Object.fromEntries(
      Object.entries(jszip)
        .map(([name, value]) => [name, new Blob([value])])
    )
    , { delimiter: '/' }
  )
  return fs
}

export const deleteOption = (name: string, details: HTMLElement, sep: string) => ({
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
})

export const renameOption = (name: string, details: HTMLElement, sep: string) => ({
  name: '📛 Rename', async click () {
    const newName = prompt('What should the new name be?')
    if (!newName) return
    if (details.parentElement === nav) {
      set(newName, await get(name))
      del(name)
      return location.reload()
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
    const blob = currentFolder[name]
    delete currentFolder[name]
    currentFolder[newName] = blob
    set(top, folder)
    location.reload()
  }
})
