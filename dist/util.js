export function path(ele, sep = "/") {
  if (ele.parentNode === document.querySelector("nav"))
    return ele.innerText;
  function getPath(details, previous = "") {
    if (details.parentNode === document.querySelector("nav"))
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
