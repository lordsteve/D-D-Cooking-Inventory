import { Recipe, RecipeIngredient } from '@const/types';
import el, { html } from '@services/elements';
import { del, get, post, put } from '@services/request';
import { fetchInventory } from '@views/inventory/inventory';

export default function home() {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    const drumstick = el.imgs?.id('drumstick');

    el.title.textContent = 'D&D Cooking Inventory!';
    const recipeDiv = el.divs?.id('recipes');
    if (!recipeDiv) return;

    const form = el.forms?.id('new-recipe') as HTMLFormElement;
    if (form)
        form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('recipe-name');
        const description = formData.get('recipe-description');
        post<Recipe>('/data/add-recipe', { name, description }).then(async (recipe) => {
            const recipeEl = html`
                <div id="recipe-${recipe.id}"></div>
            `;
            recipeDiv.appendChild(recipeEl);
            recipeEl.appendChild(html`
                <div>
                    <h2>${recipe.name}</h2>
                    <input id="description-${recipe.id}" type="text" value="${recipe.description}" />
                    <p style="font-weight:700">Benefits: <input id="benefits-${recipe.id}" type="text" value="${recipe.benefits}" /></p>
                    <p style="font-weight:700">Downside: <input id="downside-${recipe.id}" type="text" value="${recipe.downside}" /></p>
                    <p style="font-weight:700">Hidden: <input id="is-hidden${recipe.id}" type="checkbox" ${recipe.isHidden ? 'checked' : ''} /></p>
                    <p style="font-weight:700">Skill Check: <input id="skill-check-${recipe.id}" type="text" value="${recipe.skillCheck}" /></p>
                    <button id="delete-recipe-${recipe.id}"><span class="fa fa-trash"></span></button>
                </div>
            `);
            if (!el.inputs) return;
            el.inputs.id(`description-${recipe.id}`).onkeydown = (e) => {
                if (e.key !== 'Enter') return;
                const description = (e.target as HTMLInputElement).value;
                put<Recipe>('/data/update-recipe', { id: recipe.id, description }).then(() => {});
            }
            el.inputs.id(`skill-check-${recipe.id}`).onkeydown = (e) => {
                if (e.key !== 'Enter') return;
                const skillCheck = (e.target as HTMLInputElement).value;
                put<Recipe>('/data/update-recipe', { id: recipe.id, skillCheck }).then(() => {});
            }
            el.inputs.id(`benefits-${recipe.id}`).onkeydown = (e) => {
                if (e.key !== 'Enter') return;
                const benefits = (e.target as HTMLInputElement).value;
                put<Recipe>('/data/update-recipe', { id: recipe.id, benefits }).then(() => {});
            }
            el.inputs.id(`downside-${recipe.id}`).onkeydown = (e) => {
                if (e.key !== 'Enter') return;
                const downside = (e.target as HTMLInputElement).value;
                put<Recipe>('/data/update-recipe', { id: recipe.id, downside }).then(() => {});
            }
            el.inputs.id(`is-hidden${recipe.id}`).onchange = (e) => {
                const isHidden = (e.target as HTMLInputElement).checked;
                put<Recipe>('/data/update-recipe', { id: recipe.id, isHidden }).then(() => {});
            }
            el.inputs.id(`description-${recipe.id}`).onblur = (e) => {
                const description = (e.target as HTMLInputElement).value;
                if (description === recipe.description) return;
                put<Recipe>('/data/update-recipe', { id: recipe.id, description }).then(() => {});
            }
            el.inputs.id(`skill-check-${recipe.id}`).onblur = (e) => {
                const skillCheck = (e.target as HTMLInputElement).value;
                if (skillCheck === recipe.skillCheck) return;
                put<Recipe>('/data/update-recipe', { id: recipe.id, skillCheck }).then(() => {});
            }
            el.inputs.id(`benefits-${recipe.id}`).onblur = (e) => {
                const benefits = (e.target as HTMLInputElement).value;
                if (benefits === recipe.benefits) return;
                put<Recipe>('/data/update-recipe', { id: recipe.id, benefits }).then(() => {});
            }
            el.inputs.id(`downside-${recipe.id}`).onblur = (e) => {
                const downside = (e.target as HTMLInputElement).value;
                if (downside === recipe.downside) return;
                put<Recipe>('/data/update-recipe', { id: recipe.id, downside }).then(() => {});
            }
            const deleteButton = recipeDiv.querySelector<HTMLButtonElement>(`#delete-recipe-${recipe.id}`);
            if (deleteButton) 
                deleteButton.onclick = () => {
                    del<Recipe>('/data/delete-recipe', { id: recipe.id }).then(() => {
                        recipeEl.remove();
                    });
                }
            recipeEl.appendChild(html`<p>Ingredients:</p>`);
            recipeEl.appendChild(html`
                <form id="new-ingredient-${recipe.id}" style="display:flex;flex-direction:column;">
                    <input required type="text" placeholder="New Ingredient Name" name="ingredient-name">
                    <input required type="text" placeholder="Description" name="ingredient-description">
                    <input required type="number" placeholder="Quantity" name="ingredient-quantity">
                    <input type="hidden" value="${recipe.id}" name="ingredient-recipe-id">
                    <button type="submit">Add Ingredient</button>
                </form>
            `);
            if (!el.forms) return;
            el.forms.id(`new-ingredient-${recipe.id}`).onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(el.forms?.id(`new-ingredient-${recipe.id}`) as HTMLFormElement);
                const recipeId = formData.get('ingredient-recipe-id');
                const ingredientName = formData.get('ingredient-name');
                const ingredientDescription = formData.get('ingredient-description');
                const ingredientQuantity = formData.get('ingredient-quantity');
                post<RecipeIngredient>('/data/add-ingredient', {
                    recipeId,
                    ingredientName,
                    ingredientDescription,
                    ingredientQuantity,
                }).then((res) => {
                    if (!el.forms) return;
                    el.forms.id(`new-ingredient-${recipe.id}`).insertAdjacentElement('beforebegin', html`
                        <div class="ingredients">
                            <p title="${res.ingredient.description}">${res.ingredient.name}</p><p>${res.quantity}</p>
                            <button id="delete-recipe-ingredient-${res.id}"><span class="fa fa-trash"></span></button>
                        </div>
                    `);
                });
            }
            if (!el.formInputs) return;
            el.formInputs.forEach((input) => {if (input.type !== 'hidden') input.value = ''});
        });
    };

    get<Recipe[]>('/data/get-recipes').then((recipes) => {
        let writeRecipes = new Promise<void>((resolve, reject) => {
            recipes.forEach(async (recipe, i, a) => {
                if (recipe.isHidden && !isAdmin) return;
                const recipeEl = html`
                    <div  class="recipecard" id="recipe-${recipe.id}"></div>
                `
                recipeDiv.appendChild(recipeEl);
                recipeEl.appendChild(html`
                    <div>
                        <h2>${recipe.name}</h2>
                        ${(await checkInventory(recipe.recipeIngredients)).outerHTML && drumstick?.remove()}
                        ${isAdmin
                            ? `<input id="description-${recipe.id}" type="text" value="${recipe.description}" />`
                            : `<p style="font-style:italic">${recipe.description}</p>`}
                        <p><span style="font-weight:700">Benefits:</span> ${isAdmin
                            ? `<input id="benefits-${recipe.id}" type="text" value="${recipe.benefits}" />`
                            : `<span>${recipe.benefits}</span>`}</p>
                        <p><span style="font-weight:700">Downside:</span> ${isAdmin
                            ? `<input id="downside-${recipe.id}" type="text" value="${recipe.downside}" />`
                            : `<span>${recipe.downside}</span>`}</p>
                         <p><span style="font-weight:700">Skill Check:</span> ${isAdmin
                             ? `<input id="skill-check-${recipe.id}" type="text" value="${recipe.skillCheck}" />`
                             : `<span>${recipe.skillCheck}</span>`}</p>
                        ${isAdmin
                            ? `<p>Hidden: <input id="is-hidden${recipe.id}" type="checkbox" ${recipe.isHidden ? 'checked' : ''} /></p>`
                            : ''}
                        ${isAdmin
                            ? `<button id="delete-recipe-${recipe.id}"><span class="fa fa-trash"></span></button>`
                            : ''}
                    </div>
                `);
                if (isAdmin) {
                    if (!el.inputs) return;
                    el.inputs.id(`description-${recipe.id}`).onkeydown = (e) => {
                        if (e.key !== 'Enter') return;
                        const description = (e.target as HTMLInputElement).value;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, description }).then(() => {});
                    }
                    el.inputs.id(`skill-check-${recipe.id}`).onkeydown = (e) => {
                        if (e.key !== 'Enter') return;
                        const skillCheck = (e.target as HTMLInputElement).value;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, skillCheck }).then(() => {});
                    }
                    el.inputs.id(`benefits-${recipe.id}`).onkeydown = (e) => {
                        if (e.key !== 'Enter') return;
                        const benefits = (e.target as HTMLInputElement).value;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, benefits }).then(() => {});
                    }
                    el.inputs.id(`downside-${recipe.id}`).onkeydown = (e) => {
                        if (e.key !== 'Enter') return;
                        const downside = (e.target as HTMLInputElement).value;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, downside }).then(() => {});
                    }
                    el.inputs.id(`is-hidden${recipe.id}`).onchange = (e) => {
                        const isHidden = (e.target as HTMLInputElement).checked;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, isHidden }).then(() => {});
                    }
                    el.inputs.id(`description-${recipe.id}`).onblur = (e) => {
                        const description = (e.target as HTMLInputElement).value;
                        if (description === recipe.description) return;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, description }).then(() => {});
                    }
                    el.inputs.id(`skill-check-${recipe.id}`).onblur = (e) => {
                        const skillCheck = (e.target as HTMLInputElement).value;
                        if (skillCheck === recipe.skillCheck) return;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, skillCheck }).then(() => {});
                    }
                    el.inputs.id(`benefits-${recipe.id}`).onblur = (e) => {
                        const benefits = (e.target as HTMLInputElement).value;
                        if (benefits === recipe.benefits) return;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, benefits }).then(() => {});
                    }
                    el.inputs.id(`downside-${recipe.id}`).onblur = (e) => {
                        const downside = (e.target as HTMLInputElement).value;
                        if (downside === recipe.downside) return;
                        put<Recipe>('/data/update-recipe', { id: recipe.id, downside }).then(() => {});
                    }
                    const deleteButton = recipeDiv.querySelector<HTMLButtonElement>(`#delete-recipe-${recipe.id}`);
                    if (deleteButton) 
                        deleteButton.onclick = () => {
                            del<Recipe>('/data/delete-recipe', { id: recipe.id }).then(() => {
                                recipeEl.remove();
                            });
                        }
                }
                recipeEl.appendChild(html`<p style="font-weight:700; font-size: 18px">Ingredients:</p>`);
                recipe.recipeIngredients.forEach(async (recipeIngredient) => {
                    const { have, need } = await haveIngredient(recipeIngredient);
                    const ingElement = html`
                        <div class="ingredients">
                            <p style="margin: 1px 1px 1px 20px;font-weight: 600" title="${recipeIngredient.ingredient.description}">${recipeIngredient.ingredient.name}</p>
                            ${isAdmin
                                ? `<input id="recipe-ingredient-quantity-${recipeIngredient.id}" type="number" value="${recipeIngredient.quantity}" />`
                                : `<p style="margin: 1px 1px 1px 20px; color:${have >= need ? 'green' : 'red'}">(have ${have}, need ${need})</p>`}
                            ${isAdmin
                                ? `<button id="delete-recipe-ingredient-${recipeIngredient.id}"><span  class="fa fa-trash"></span></button>`
                                : ''}
                        </div>
                    `
                    recipeEl.appendChild(ingElement);
                    if (isAdmin) {
                        if (!el.inputs) return;
                        el.inputs.id(`recipe-ingredient-quantity-${recipeIngredient.id}`).onkeydown = (e) => {
                            if (e.key !== 'Enter') return;
                            const quantity = (e.target as HTMLInputElement).value;
                            put<RecipeIngredient>('/data/update-recipe-ingredient', { id: recipeIngredient.id, quantity }).then(() => {});
                        }
                        el.inputs.id(`recipe-ingredient-quantity-${recipeIngredient.id}`).onblur = (e) => {
                            const quantity = (e.target as HTMLInputElement).value;
                            if (quantity === recipeIngredient.quantity.toString()) return;
                            put<RecipeIngredient>('/data/update-recipe-ingredient', { id: recipeIngredient.id, quantity }).then(() => {});
                        }
                        const deleteIngButton = recipeEl.querySelector<HTMLButtonElement>(`#delete-recipe-ingredient-${recipeIngredient.id}`)
                        if (!deleteIngButton) return;
                        deleteIngButton.onclick = () => {
                            del<RecipeIngredient>('/data/delete-ingredient', { id: recipeIngredient.id }).then(() => {
                                ingElement.remove();
                            });
                        }
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
    
                if (a.length > i+1) resolve();
            });
        });
        writeRecipes.then(() => {
            if(isAdmin && el.forms)
            el.forms.forEach((form) => {
                if (form.id.startsWith('new-ingredient-')) {
                    form.onsubmit = (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const recipeId = formData.get('ingredient-recipe-id');
                        const ingredientName = formData.get('ingredient-name');
                        const ingredientDescription = formData.get('ingredient-description');
                        const ingredientQuantity = formData.get('ingredient-quantity');
                        post<RecipeIngredient>('/data/add-ingredient', {
                                recipeId,
                                ingredientName,
                                ingredientDescription,
                                ingredientQuantity,
                            }).then((res) => {
                                form.insertAdjacentElement('beforebegin', html`
                                    <div class="ingredients">
                                        <p title="${res.ingredient.description}">${res.ingredient.name}</p><p>${res.quantity}</p>
                                        <button id="delete-recipe-ingredient-${res.id}"><span class="fa fa-trash"></span></button>
                                    </div>
                                `);
                                if (!el.formInputs) return;
                                el.formInputs.forEach((input) => {if (input.type !== 'hidden') input.value = ''});
                                if (!el.buttons) return;
                                el.buttons.id(`delete-recipe-ingredient-${res.id}`).onclick = () => {
                                    del<RecipeIngredient>('/data/delete-ingredient', { id: res.id }).then(() => {
                                        if (!el.buttons) return;
                                        el.buttons.id(`delete-recipe-ingredient-${res.id}`).parentElement?.remove();
                                    });
                                }
                            });
                    };
                }
            });
        });
    }); 
}

async function checkInventory(recipeIngredients: RecipeIngredient[]) {
    const inventory = await fetchInventory()
    let check: HTMLElement = html`
        <p style="color:orange;">There are no ingredients for this recipe yet!</p>
    `;
    for (const recipeIngredient of recipeIngredients) {
        const inventoryQuantity = inventory[recipeIngredient.ingredient.name.toLowerCase()] || 0;
        if (inventoryQuantity < recipeIngredient.quantity) {
            check = html`
                <p style="color:red; font-weight:700;text-align: center;">Missing Ingredients!</p>
            `;
            break;
        } else {
            check = html`
                <p style="color:green; font-weight:700;text-align: center;">Ready to Cook!</p>
            `;
        }
    }
    return check;
}

async function haveIngredient(recipeIngredient: RecipeIngredient) {
    const inventory = await fetchInventory();
    return { have: inventory[recipeIngredient.ingredient.name.toLowerCase()] ?? 0, need: recipeIngredient.quantity };
}