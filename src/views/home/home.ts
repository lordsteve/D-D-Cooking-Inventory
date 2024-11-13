import el, { html } from '@services/elements';
import { get } from '@services/request';
import { Recipe } from '@const/types';

export default function home() {
    el.title.textContent = 'D&D Cooking Inventory!';
    const recipeDiv = el.divs.id('recipes');

    get<Recipe[]>('/data/get-recipes').then((recipes) => {
        recipes.forEach((recipe) => {
            recipeDiv.appendChild(html`
                <div>
                    <h2>${recipe.name}</h2>
                    <h3>${recipe.description}</h3>
                </div>
            `);
            recipeDiv.appendChild(html`<p>Ingredients:</p>`);
            recipe.recipeIngredients.forEach((recipeIngredient) => {
                recipeDiv.appendChild(html`
                    <div class="ingredients">
                        <p>${recipeIngredient.ingredient.name}</p><p>${recipeIngredient.quantity}</p>
                    </div>
                `);
            });
            recipeDiv.appendChild(html`
                <form style="display:flex;flex-direction:column;">
                    <input type="text" placeholder="Add Ingredient">
                    <input type="number" placeholder="Quantity">
                    <input type="hidden" value="${recipe.id}">
                    <button type="submit">Add</button>
                </form>
            `);
        });
    });
}