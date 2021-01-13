export function path (ele: HTMLElement, sep = '/') {
  if (ele.parentNode === document.querySelector('nav')) return ele.innerText
  // ////////////
  function getPath (details: Node & ParentNode, previous: string = ''): string {
    if (details.parentNode === document.querySelector('nav')) return details.querySelector('summary')?.innerText + sep + previous
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
