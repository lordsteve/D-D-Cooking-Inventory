"use strict";
(() => {
  // src/const/pathNames.ts
  var PathNames = class {
    static HOME = "/";
    static basePath = () => `/${window.location.pathname.split(/[\/#?]/)[1]}`;
    static subdirectories = () => window.location.pathname.split(/[\/#?]/).slice(2);
  };

  // src/services/cookieJar.ts
  var CookieJar = class {
    static #kebabToCamelCase = (str) => {
      return str.replace(/-([a-z])/g, function(match, letter) {
        return letter.toUpperCase();
      });
    };
    /**
    * Returns all cookies as an object or the value of a specific cookie
    * @param {string?} cookieName
    * @return {object | string | boolean | number | null | undefined}
    */
    static get = (cookieName) => {
      const cookieObj = {};
      document.cookie.split(";").forEach((cookie) => {
        cookieObj[this.#kebabToCamelCase(cookie.split("=")[0].trim())] = typeof cookie.split("=")[1] === "string" && cookie.split("=")[1].startsWith("{") ? JSON.parse(cookie.split("=")[1]) : typeof cookie.split("=")[1] === "string" && (cookie.split("=")[1] === "true" || cookie.split("=")[1] === "false") ? Boolean(cookie.split("=")[1]) : !isNaN(Number(cookie.split("=")[1])) ? Number(cookie.split("=")[1]) : cookie.split("=")[1];
      });
      return cookieName ? cookieObj[this.#kebabToCamelCase(cookieName)] : Object.keys(cookieObj).length === 0 ? null : cookieObj;
    };
    /**
     * Sets a cookie
     * Use Date.ToUTCString() for expires
     * @param {string} cookieName 
     * @param {string | boolean | number | object} value 
     * @param {string} expires
     * @return {void}
     */
    static set = (cookieName, value, expires) => {
      if (this.get(cookieName)) {
        this.delete(cookieName);
      }
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      document.cookie = `${cookieName}=${value}; expires=${expires};`;
    };
    /**
     * Deletes a cookie
     * @param {string} cookieName
     * @return {void}
     */
    static delete = (cookieName) => {
      if (this.get(cookieName)) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      } else {
        console.error(`Cookie ${cookieName} does not exist.`);
      }
    };
    /**
     * Edits an existing cookie
     * Use Date.ToUTCString() for expires
     * @param {string} cookieName 
     * @param {string | boolean | number | object} value 
     * @param {string} expires 
     * @return {void}
     */
    static edit = (cookieName, value, expires) => {
      if (this.get(cookieName)) {
        this.delete(cookieName);
        this.set(cookieName, value, expires);
      } else {
        console.error(`Cookie ${cookieName} does not exist.`);
      }
    };
  };

  // src/services/storageBox.ts
  var StorageBox = class {
    constructor() {
    }
    static get(key) {
      const result = localStorage.getItem(key);
      if (result === null) return null;
      if (result === "true" || result === "false") {
        return Boolean(result);
      } else if (!isNaN(Number(result))) {
        return Number(result);
      } else {
        try {
          return JSON.parse(result);
        } catch (e) {
          return result;
        }
        ;
      }
    }
    static set(key, value) {
      if (typeof value === "object") {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value.toString());
      }
      ;
    }
    static remove(key) {
      localStorage.removeItem(key);
    }
    static clear() {
      localStorage.clear();
    }
  };

  // src/services/elements.ts
  var El = class {
    constructor(path, submitted = false) {
      this.submitted = submitted;
      switch (path) {
        case PathNames.HOME:
          break;
        default:
          break;
      }
      if (this.selectors.length > 0) {
        this.selectors.forEach((selector) => {
          selector.onclick = (e) => {
            e.preventDefault();
            selector.focus();
          };
          [...selector.options].forEach((option) => {
            option.onmousedown = (e) => {
              e.preventDefault();
              if (option.value === e.target?.value) {
                option.selected = !option.selected;
              }
            };
          });
        });
      }
      if (this.formInputs && this.submitButton) {
        let requiredInputs = [...this.formInputs].filter((input) => input.required);
        let disableSubmitButton = () => {
          if (this.submitButton)
            this.submitButton.disabled = !requiredInputs.every((input) => input.value.trim().length > 0);
        };
        setTimeout(disableSubmitButton, 1e3);
        requiredInputs.forEach((input) => {
          input.oninput = /* @__PURE__ */ ((oldOnInput) => {
            return (e) => {
              if (oldOnInput) oldOnInput.call(input, e);
              disableSubmitButton();
            };
          })(input.oninput?.bind(input));
        });
        this.forms.forEach((form) => {
          form.onsubmit = ((oldOnSubmit) => {
            form.submitButton = form.querySelector('button[type="submit"]');
            return (e) => {
              if (oldOnSubmit) oldOnSubmit.call(form, e);
              form.submitButton.disabled = true;
              form.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
              this.submitted = true;
            };
          })(form.onsubmit?.bind(form));
        });
      }
      window.onbeforeunload = /* @__PURE__ */ ((oldBeforeUnload) => {
        return (e) => {
          if (oldBeforeUnload) oldBeforeUnload.call(window, e);
          if (this.formInputs.length == 0) return;
          if (this.submitted) {
            StorageBox.clear();
            return;
          }
          let values = {};
          this.formInputs.forEach((input) => {
            if (input && input.name && !input.name.startsWith("_") && input.type !== "file")
              values[input.name] = input.value;
          });
          StorageBox.set("formValues", values);
        };
      })(window.onbeforeunload?.bind(window));
      window.onload = /* @__PURE__ */ ((oldLoad) => {
        return (e) => {
          if (oldLoad) oldLoad.call(window, e);
          if (this.formInputs.length == 0) return;
          let values = StorageBox.get("formValues");
          this.formInputs.forEach((input) => {
            if (input && input.name && !input.name.startsWith("_") && input.type !== "file" && values && values[input.name]) input.value = values[input.name];
          });
          StorageBox.remove("formValues");
        };
      })(window.onload?.bind(window));
      if (this.cookieBanner) {
        if (CookieJar.get("cookies-are-cool")) {
          this.cookieBanner.remove();
        }
      }
      ;
      if (this.cookieBannerButton) {
        this.cookieBannerButton.onclick = () => {
          CookieJar.set("cookies-are-cool", true, new Date((/* @__PURE__ */ new Date()).getFullYear() + 999, 0).toUTCString());
          if (this.cookieBanner)
            this.cookieBanner.remove();
        };
      }
    }
    static getElement = (selector) => {
      let el = document.querySelector(selector);
      if (!el) {
        throw new Error(`Node with selector "${selector}" not found!`);
      } else {
        if (el.getAttribute("bg"))
          el.style.backgroundImage = `url(${el.getAttribute("bg")})`;
        return el;
      }
    };
    static getElements = (selector) => {
      let els = document.querySelectorAll(selector);
      if (!els || els.length == 0) {
        throw new Error(`Nodes with selector "${selector}" not found!`);
      } else {
        els.id = (id) => {
          const el = [...els].find((el2) => el2.id === id);
          if (!el) throw new Error(`Element with id "${id}" not found.`);
          return el;
        };
        return els;
      }
    };
    static get root() {
      return this.getElement(":root");
    }
    set root(root) {
      this.root = root;
    }
    static get body() {
      return this.getElement("body");
    }
    set body(body) {
      this.body = body;
    }
    static get title() {
      return this.getElement("title");
    }
    set title(title) {
      this.title = title;
    }
    static get inputs() {
      return this.getElements("input");
    }
    set inputs(inputs) {
      this.inputs = inputs;
    }
    static get textareas() {
      return this.getElements("textarea");
    }
    set textareas(textareas) {
      this.textareas = textareas;
    }
    static get nav() {
      return this.getElement("nav");
    }
    set nav(nav2) {
      this.nav = nav2;
    }
    static csrfToken = "";
    static get modal() {
      return this.getElement("#modal");
    }
    set modal(modal) {
      this.modal = modal;
    }
    static get loader() {
      let loader = document.querySelector("loader");
      if (!loader) {
        let spinner = document.createElement("spinner");
        loader = document.createElement("loader");
        loader.appendChild(spinner);
        document.body.appendChild(loader);
      }
      return loader;
    }
    set loader(loader) {
      this.loader = loader;
    }
    static get selectors() {
      return this.getElements("select");
    }
    set selectors(selectors) {
      this.selectors = selectors;
    }
    static get buttons() {
      return this.getElements("button");
    }
    set buttons(buttons) {
      this.buttons = buttons;
    }
    static get divs() {
      return this.getElements("div");
    }
    set divs(divs) {
      this.divs = divs;
    }
    static get forms() {
      return this.getElements("form");
    }
    set forms(forms) {
      this.forms = forms;
    }
    static get formInputs() {
      return this.getElements("form input, form textarea");
    }
    set formInputs(formInputs) {
      this.formInputs = formInputs;
    }
    static get submitButton() {
      return this.getElement('button[type="submit"]');
    }
    set submitButton(submitButton) {
      this.submitButton = submitButton;
    }
    static get cookieBanner() {
      return this.getElement("cookie-banner");
    }
    set cookieBanner(cookieBanner) {
      this.cookieBanner = cookieBanner;
    }
    static get cookieBannerButton() {
      return this.getElement("cookie-banner button");
    }
    set cookieBannerButton(cookieBannerButton) {
      this.cookieBannerButton = cookieBannerButton;
    }
  };
  function html(html2, ...values) {
    let string = "";
    html2.forEach((str, i) => string += str + (values[i] ?? ""));
    const template = document.createElement("template");
    template.innerHTML = string.trim();
    return template.content.firstChild;
  }
  function htmlstring(html2, ...values) {
    let string = "";
    html2.forEach((str, i) => string += str + (values[i] ?? ""));
    return string;
  }

  // src/services/request.ts
  function initLoader() {
    window.fetch = /* @__PURE__ */ ((oldFetch, input = "", init) => {
      return async (url = input, options = init) => {
        El.loader;
        if (options && options.method !== "GET") {
          El.csrfToken = await oldFetch("/csrf-token").then((response2) => response2.text());
          options.headers ? options.headers["X-CSRF-TOKEN"] = El.csrfToken : options = {
            ...options,
            headers: {
              "X-CSRF-TOKEN": El.csrfToken
            }
          };
        }
        if (options && options.headers) options.headers["X-Requested-With"] = "Elemental";
        if (!options) options = { headers: { "X-Requested-With": "Elemental" } };
        if (!options.headers) options.headers = { "X-Requested-With": "Elemental" };
        const response = await oldFetch(url, options);
        El.loader.remove();
        return response;
      };
    })(window.fetch);
    window.onload = ((oldLoad) => {
      El.loader;
      return (e) => {
        if (!!oldLoad) oldLoad.call(window, e);
        El.loader.remove();
      };
    })(window.onload?.bind(window));
  }
  async function request(method, path, data = null, evalResult = true) {
    let payLoad = void 0;
    if (method !== "GET") payLoad = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    };
    const routePostfix = await getPostfix(method, data);
    const response = await fetch(`${path}${routePostfix}`, payLoad);
    return evalResult ? response.json().then((obj) => obj) : response;
  }
  async function getPostfix(method, data = null) {
    let postfix = "";
    if (data && method === "GET") {
      const params = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        params.append(key, data[key].toString());
      });
      postfix = `?${params.toString()}`;
    }
    return postfix;
  }
  async function get(path, data = null) {
    return await request("GET", path, data);
  }
  async function getHtml(path, data = null) {
    return await request("GET", path, data, false).then((response) => response.text()).then((html2) => {
      const ele = new DOMParser().parseFromString(html2, "text/html").body.childNodes;
      var result = ele.length === 1 ? ele[0] : ele;
      return result;
    });
  }
  async function post(path, data = null) {
    return await request("POST", path, data);
  }
  async function put(path, data = null) {
    return await request("PUT", path, data);
  }
  async function del(path, data = null) {
    return await request("DELETE", path, data, false);
  }

  // src/views/inventory/inventory.ts
  async function about() {
    El.title.textContent = "Ingredient Inventory";
    const inventoryDiv = El.divs.id("inventory");
    const inventory = await fetchInventory();
    Object.entries(inventory).forEach(([ingredient, quantity]) => {
      inventoryDiv.appendChild(html`
            <p>${ingredient}: ${quantity}</p>
        `);
    });
  }
  async function fetchInventory() {
    const { SHEET_ID, API_KEY } = await get(`/data/get-inventory`);
    const data = await get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
    return parseInventoryData(data.values);
  }
  function parseInventoryData(data) {
    const inventory = {};
    data.slice(1).forEach((row) => {
      const [ingredient, quantity] = row;
      inventory[ingredient.toLowerCase()] = parseInt(quantity, 10);
    });
    return inventory;
  }

  // src/views/home/home.ts
  function home() {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get("admin") === "true";
    El.title.textContent = "D&D Cooking Inventory!";
    const recipeDiv = El.divs.id("recipes");
    get("/data/get-recipes").then((recipes) => {
      let writeRecipes = new Promise((resolve, reject) => {
        recipes.forEach(async (recipe, i, a) => {
          if (recipe.isHidden && !isAdmin) return;
          const recipeEl = html`
                    <div id="recipe-${recipe.id}"></div>
                `;
          recipeDiv.appendChild(recipeEl);
          recipeEl.appendChild(html`
                    <div>
                        <h2>${recipe.name}</h2>
                        ${isAdmin ? `<input id="description-${recipe.id}" type="text" value="${recipe.description}" />` : `<p style="font-style:italic">${recipe.description}</p>`}
                        <p>Skill Check: ${isAdmin ? `<input id="skill-check-${recipe.id}" type="text" value="${recipe.skillCheck}" />` : `<span style="font-style:italic">${recipe.skillCheck}</span>`}</p>
                        <p>Benefits: ${isAdmin ? `<input id="benefits-${recipe.id}" type="text" value="${recipe.benefits}" />` : `<span style="font-style:italic">${recipe.benefits}</span>`}</p>
                        <p>Downside: ${isAdmin ? `<input id="downside-${recipe.id}" type="text" value="${recipe.downside}" />` : `<span style="font-style:italic">${recipe.downside}</span>`}</p>
                        ${isAdmin ? `<p>Hidden: <input id="is-hidden${recipe.id}" type="checkbox" ${recipe.isHidden ? "checked" : ""} /></p>` : ""}
                        ${isAdmin ? `<button id="delete-recipe-${recipe.id}"><span class="fa fa-trash"></span></button>` : ""}
                    </div>
                `);
          if (isAdmin) {
            El.inputs.id(`description-${recipe.id}`).onkeydown = (e) => {
              if (e.key !== "Enter") return;
              const description = e.target.value;
              put("/data/update-recipe", { id: recipe.id, description }).then(() => {
              });
            };
            El.inputs.id(`skill-check-${recipe.id}`).onkeydown = (e) => {
              if (e.key !== "Enter") return;
              const skillCheck = e.target.value;
              put("/data/update-recipe", { id: recipe.id, skillCheck }).then(() => {
              });
            };
            El.inputs.id(`benefits-${recipe.id}`).onkeydown = (e) => {
              if (e.key !== "Enter") return;
              const benefits = e.target.value;
              put("/data/update-recipe", { id: recipe.id, benefits }).then(() => {
              });
            };
            El.inputs.id(`downside-${recipe.id}`).onkeydown = (e) => {
              if (e.key !== "Enter") return;
              const downside = e.target.value;
              put("/data/update-recipe", { id: recipe.id, downside }).then(() => {
              });
            };
            El.inputs.id(`is-hidden${recipe.id}`).onchange = (e) => {
              const isHidden = e.target.checked;
              put("/data/update-recipe", { id: recipe.id, isHidden }).then(() => {
              });
            };
            El.inputs.id(`description-${recipe.id}`).onblur = (e) => {
              const description = e.target.value;
              if (description === recipe.description) return;
              put("/data/update-recipe", { id: recipe.id, description }).then(() => {
              });
            };
            El.inputs.id(`skill-check-${recipe.id}`).onblur = (e) => {
              const skillCheck = e.target.value;
              if (skillCheck === recipe.skillCheck) return;
              put("/data/update-recipe", { id: recipe.id, skillCheck }).then(() => {
              });
            };
            El.inputs.id(`benefits-${recipe.id}`).onblur = (e) => {
              const benefits = e.target.value;
              if (benefits === recipe.benefits) return;
              put("/data/update-recipe", { id: recipe.id, benefits }).then(() => {
              });
            };
            El.inputs.id(`downside-${recipe.id}`).onblur = (e) => {
              const downside = e.target.value;
              if (downside === recipe.downside) return;
              put("/data/update-recipe", { id: recipe.id, downside }).then(() => {
              });
            };
            const deleteButton = recipeDiv.querySelector(`#delete-recipe-${recipe.id}`);
            if (deleteButton)
              deleteButton.onclick = () => {
                del("/data/delete-recipe", { id: recipe.id }).then(() => {
                  recipeEl.remove();
                });
              };
          }
          recipeEl.appendChild(await checkInventory(recipe.recipeIngredients));
          recipeEl.appendChild(html`<p>Ingredients:</p>`);
          recipe.recipeIngredients.forEach((recipeIngredient) => {
            const ingElement = html`
                        <div class="ingredients">
                            <p title="${recipeIngredient.ingredient.description}">${recipeIngredient.ingredient.name}</p>
                            ${isAdmin ? `<input id="recipe-ingredient-quantity-${recipeIngredient.id}" type="number" value="${recipeIngredient.quantity}" />` : `<p>${recipeIngredient.quantity}</p>`}
                            ${isAdmin ? `<button id="delete-recipe-ingredient-${recipeIngredient.id}"><span  class="fa fa-trash"></span></button>` : ""}
                        </div>
                    `;
            recipeEl.appendChild(ingElement);
            if (isAdmin) {
              El.inputs.id(`recipe-ingredient-quantity-${recipeIngredient.id}`).onkeydown = (e) => {
                if (e.key !== "Enter") return;
                const quantity = e.target.value;
                put("/data/update-recipe-ingredient", { id: recipeIngredient.id, quantity }).then(() => {
                });
              };
              El.inputs.id(`recipe-ingredient-quantity-${recipeIngredient.id}`).onblur = (e) => {
                const quantity = e.target.value;
                if (quantity === recipeIngredient.quantity.toString()) return;
                put("/data/update-recipe-ingredient", { id: recipeIngredient.id, quantity }).then(() => {
                });
              };
              const deleteIngButton = recipeEl.querySelector(`#delete-recipe-ingredient-${recipeIngredient.id}`);
              if (!deleteIngButton) return;
              deleteIngButton.onclick = () => {
                del("/data/delete-ingredient", { id: recipeIngredient.id }).then(() => {
                  ingElement.remove();
                });
              };
            }
          });
          if (isAdmin)
            recipeEl.appendChild(html`
                        <form id="new-ingredient-${recipe.id}" style="display:flex;flex-direction:column;">
                            <input required type="text" placeholder="New Ingredient Name" name="ingredient-name">
                            <input required type="text" placeholder="Description" name="ingredient-description">
                            <input required type="number" placeholder="Quantity" name="ingredient-quantity">
                            <input type="hidden" value="${recipe.id}" name="ingredient-recipe-id">
                            <button type="submit">Add Ingredient</button>
                        </form>
                    `);
          if (a.length > i + 1) resolve();
        });
      });
      writeRecipes.then(() => {
        if (isAdmin)
          El.forms.forEach((form) => {
            if (form.id.startsWith("new-ingredient-")) {
              form.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const recipeId = formData.get("ingredient-recipe-id");
                const ingredientName = formData.get("ingredient-name");
                const ingredientDescription = formData.get("ingredient-description");
                const ingredientQuantity = formData.get("ingredient-quantity");
                post("/data/add-ingredient", {
                  recipeId,
                  ingredientName,
                  ingredientDescription,
                  ingredientQuantity
                }).then((res) => {
                  form.insertAdjacentElement("beforebegin", html`
                                    <div class="ingredients">
                                        <p title="${res.ingredient.description}">${res.ingredient.name}</p><p>${res.quantity}</p>
                                        <button id="delete-recipe-ingredient-${res.id}"><span class="fa fa-trash"></span></button>
                                    </div>
                                `);
                  El.formInputs.forEach((input) => {
                    if (input.type !== "hidden") input.value = "";
                  });
                  El.buttons.id(`delete-recipe-ingredient-${res.id}`).onclick = () => {
                    del("/data/delete-ingredient", { id: res.id }).then(() => {
                      El.buttons.id(`delete-recipe-ingredient-${res.id}`).parentElement?.remove();
                    });
                  };
                });
              };
            } else if (form.id === "new-recipe") {
              form.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const name = formData.get("recipe-name");
                const description = formData.get("recipe-description");
                post("/data/add-recipe", { name, description }).then((recipe) => {
                  const recipeEl = html`
                                <div id="recipe-${recipe.id}"></div>
                            `;
                  recipeDiv.appendChild(recipeEl);
                  recipeEl.appendChild(html`
                                <div>
                                    <h2>${recipe.name}</h2>
                                    <h3>${recipe.description}</h3>
                                    <button id="delete-recipe-${recipe.id}"><span class="fa fa-trash"></span></button>
                                </div>
                            `);
                  const deleteButton = recipeEl.querySelector(`#delete-recipe-${recipe.id}`);
                  if (deleteButton)
                    deleteButton.onclick = () => {
                      del("/data/delete-recipe", { id: recipe.id }).then(() => {
                        recipeEl.remove();
                      });
                    };
                  recipeEl.appendChild(html`<p>Ingredients:</p>`);
                  recipeEl.appendChild(html`
                                <form id="new-ingredient-${recipe.id}" style="display:flex;flex-direction:column;">
                                    <input required type="text" placeholder="Add Ingredient" name="ingredient-name">
                                    <input required type="text" placeholder="Description" name="ingredient-description">
                                    <input required type="number" placeholder="Quantity" name="ingredient-quantity">
                                    <input type="hidden" value="${recipe.id}" name="ingredient-recipe-id">
                                    <button type="submit">Add Ingredient</button>
                                </form>
                            `);
                  El.forms.id(`new-ingredient-${recipe.id}`).onsubmit = (e2) => {
                    e2.preventDefault();
                    const formData2 = new FormData(El.forms.id(`new-ingredient-${recipe.id}`));
                    const recipeId = formData2.get("ingredient-recipe-id");
                    const ingredientName = formData2.get("ingredient-name");
                    const ingredientDescription = formData2.get("ingredient-description");
                    const ingredientQuantity = formData2.get("ingredient-quantity");
                    post("/data/add-ingredient", {
                      recipeId,
                      ingredientName,
                      ingredientDescription,
                      ingredientQuantity
                    }).then((res) => {
                      El.forms.id(`new-ingredient-${recipe.id}`).insertAdjacentElement("beforebegin", html`
                                        <div class="ingredients">
                                            <p title="${res.ingredient.description}">${res.ingredient.name}</p><p>${res.quantity}</p>
                                            <button id="delete-recipe-ingredient-${res.id}"><span class="fa fa-trash"></span></button>
                                        </div>
                                    `);
                    });
                  };
                  El.formInputs.forEach((input) => {
                    if (input.type !== "hidden") input.value = "";
                  });
                });
              };
            }
          });
      });
    });
  }
  async function checkInventory(recipeIngredients) {
    const inventory = await fetchInventory();
    let check = html``;
    recipeIngredients.forEach((recipeIngredient) => {
      const inventoryQuantity = inventory[recipeIngredient.ingredient.name.toLowerCase()] || 0;
      if (inventoryQuantity < recipeIngredient.quantity) {
        check = html`
                <p style="color:red;">You do not have the ingredients for this recipe!</p>
            `;
      } else {
        check = html`
                <p style="color:green;">You have the ingredients for this recipe!</p>
            `;
      }
    });
    return check;
  }

  // src/views/home/home.template.ts
  var homeTemplate = (heading, welcome = null) => {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get("admin") === "true";
    welcome = !welcome ? "" : htmlstring`<p>${welcome}</p>`;
    return html`
    <el-home>
        <div class="content-slate">
            <section>
                <h1>${heading}</h1>
                ${welcome}
                <div id="recipes"></div>

                ${isAdmin ? `<form id="new-recipe" style="display:flex;flex-direction:column;">
                    <input required type="text" placeholder="New Recipe Name" name="recipe-name">
                    <input required type="text" placeholder="Description" name="recipe-description">
                    <button type="submit">Add Recipe</button>
                </form>` : ""}
            </section>
        </div>
    </el-home>
    `;
  };
  var home_template_default = homeTemplate;

  // src/views/nav/nav.ts
  function nav() {
  }

  // src/views/nav/nav.template.ts
  var navTemplate = html`
    <nav>
        <ul>
            <li><a href="/">Recipes</a></li>
            <li><a href="/inventory">Inventory</a></li>
        </ul>
    </nav>`;
  var nav_template_default = navTemplate;

  // src/views/inventory/inventory.template.ts
  var about2 = html`
    <el-inv>
        <div class="content-slate">
            <section>
                <div id="inventory"></div>
            </section>
        </div>
    </el-inv>
`;
  var inventory_template_default = about2;

  // src/views/sidebar/sidebar.ts
  function sidebar() {
  }

  // src/views/sidebar/sidebar.template.ts
  var sidebarTemplate = (items) => {
    const itemsList = Object.keys(items).map((item) => {
      return htmlstring`<li><a href="${item}">${items[item]}</a></li>`;
    });
    return html`
        <el-sidebar>
            <ul>
                ${itemsList.join("")}
            </ul>
        </el-sidebar>`;
  };
  var sidebar_template_default = sidebarTemplate;

  // src/views/index.ts
  var views = {
    home,
    homeTemplate: home_template_default,
    nav,
    navTemplate: nav_template_default,
    inventory: about,
    inventoryTemplate: inventory_template_default,
    sidebar,
    sidebarTemplate: sidebar_template_default
  };
  var views_default = views;

  // src/main.ts
  initLoader();
  El.body.appendChild(views_default.navTemplate);
  views_default.nav();
  switch (location.pathname) {
    case "/":
      El.body.appendChild(views_default.homeTemplate(
        `Here are your recipes!`
      ));
      views_default.home();
      break;
    case "/inventory":
      El.body.appendChild(views_default.inventoryTemplate);
      views_default.inventory();
    default:
      getHtml(location.pathname).then((page) => {
        if (page instanceof HTMLElement) {
          El.body.appendChild(page);
        } else if (page instanceof NodeList) {
          page.forEach((element) => {
            El.body.appendChild(element);
          });
        }
        if (El.nav.nextElementSibling === null) {
          El.body.appendChild(views_default.homeTemplate("404", "Page Not Found"));
          views_default.home();
        }
      });
      break;
  }
})();
