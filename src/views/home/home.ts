import el, { html } from '@services/elements';
import { del, get, post } from '@services/request';
import { Ingredient, Recipe, RecipeIngredient } from '@const/types';

export default function home() {
    el.title.textContent = 'D&D Cooking Inventory!';
    const recipeDiv = el.divs.id('recipes');

    get<Recipe[]>('/data/get-recipes').then((recipes) => {
        recipes.forEach((recipe) => {
            const recipeEl = html`
                <div id="recipe-${recipe.id}"></div>
            `
            recipeDiv.appendChild(recipeEl);
            recipeEl.appendChild(html`
                <div>
                    <h2>${recipe.name}</h2>
                    <h3>${recipe.description}</h3>
                    <button id="delete-recipe-${recipe.id}"><span class="fa fa-trash"></span></button>
                </div>
            `);
            const deleteButton = recipeDiv.querySelector<HTMLButtonElement>(`#delete-recipe-${recipe.id}`);
            if (deleteButton) 
                deleteButton.onclick = () => {
                    del<Recipe>('/data/delete-recipe', { id: recipe.id }).then(() => {
                        recipeEl.remove();
                    });
                }
            recipeEl.appendChild(html`<p>Ingredients:</p>`);
            recipe.recipeIngredients.forEach((recipeIngredient) => {
                const ingElement = html`
                    <div class="ingredients">
                        <p title="${recipeIngredient.ingredient.description}">${recipeIngredient.ingredient.name}</p><p>${recipeIngredient.quantity}</p>
                        <button id="delete-recipe-ingredient-${recipeIngredient.id}"><span  class="fa fa-trash"></span></button>
                    </div>
                `
                recipeEl.appendChild(ingElement);
                const deleteIngButton = recipeEl.querySelector<HTMLButtonElement>(`#delete-recipe-ingredient-${recipeIngredient.id}`)
                if (!deleteIngButton) return;
                deleteIngButton.onclick = () => {
                    del<RecipeIngredient>('/data/delete-ingredient', { id: recipeIngredient.id }).then(() => {
                        ingElement.remove();
                    });
                }
            });
            recipeEl.appendChild(html`
                <form id="new-ingredient-${recipe.id}" style="display:flex;flex-direction:column;">
                    <input required type="text" placeholder="New Ingredient Name" name="ingredient-name">
                    <input required type="text" placeholder="Description" name="ingredient-description">
                    <input required type="number" placeholder="Quantity" name="ingredient-quantity">
                    <input type="hidden" value="${recipe.id}" name="ingredient-recipe-id">
                    <button type="submit">Add Ingredient</button>
                </form>
            `);
        });

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
                            el.formInputs.forEach((input) => {if (input.type !== 'hidden') input.value = ''});
                    });
                };
            } else if (form.id === 'new-recipe') {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const name = formData.get('recipe-name');
                    const description = formData.get('recipe-description');
                    post<Recipe>('/data/add-recipe', { name, description }).then((recipe) => {
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
                        const deleteButton = recipeEl.querySelector<HTMLButtonElement>(`#delete-recipe-${recipe.id}`);
                        if (deleteButton) 
                            deleteButton.onclick = () => {
                                del<Recipe>('/data/delete-recipe', { id: recipe.id }).then(() => {
                                    recipeEl.remove();
                                });
                            }
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
                        el.forms.id(`new-ingredient-${recipe.id}`).onsubmit = (e) => {
                            e.preventDefault();
                            const formData = new FormData(el.forms.id(`new-ingredient-${recipe.id}`) as HTMLFormElement);
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
                                el.forms.id(`new-ingredient-${recipe.id}`).insertAdjacentElement('beforebegin', html`
                                    <div class="ingredients">
                                        <p title="${res.ingredient.description}">${res.ingredient.name}</p><p>${res.quantity}</p>
                                        <button id="delete-recipe-ingredient-${res.id}"><span class="fa fa-trash"></span></button>
                                    </div>
                                `);
                            });
                        }
                        el.formInputs.forEach((input) => {if (input.type !== 'hidden') input.value = ''});
                    });
                };
            }
        });
    });
}