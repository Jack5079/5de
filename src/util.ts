import { languages } from 'monaco-editor'

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
  menu.style.left = x + 'px'
  menu.style.top = y + 'px'
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
