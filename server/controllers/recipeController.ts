import { Database, GoogleSheetsService } from "services";
import http from "http";
import { Recipe } from "services/database/entity/Recipe";
import { RecipeIngredient } from "services/database/entity/RecipeIngredient";
import { readBody } from "../main";

const recipeRepository = Database.getRepository('Recipe');
const recipeIngredientRepository = Database.getRepository('RecipeIngredient');

export default class RecipeController {
    static async getRecipes(req: http.IncomingMessage, res: http.ServerResponse) {
        const inventory = await GoogleSheetsService.fetchInventory();
        return Database.initialize().then(async () => {
            const recipes = await recipeRepository.find() as RecipeList[];
            for (const recipe of recipes) {
                let canMake = true;
                for (const recipeIngredient of recipe.recipeIngredients || []) {
                    recipeIngredient.have = inventory[recipeIngredient.ingredient.name.toLowerCase()] || 0;
                }
                recipe.canMake = recipe.recipeIngredients?.every(ingredient => ingredient.have >= ingredient.quantity);
            }

            // sort recipes by canMake
            recipes.sort((a, b) => {
                if (a.canMake && !b.canMake) {
                    return -1;
                } else if (!a.canMake && b.canMake) {
                    return 1;
                }
                return 0;
            });
            return {
                response: JSON.stringify(recipes),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async addRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const body = await readBody(req);
        if (
            !body.recipeName || !body.recipeDescription || !body.recipeIngredients ||
            !(typeof body.recipeName === 'string') || !(typeof body.recipeDescription === 'string') || !(body.recipeIngredients instanceof Array)
        ) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipe = recipeRepository.create({
                name: body.recipeName,
                description: body.recipeDescription
            });
            await recipeRepository.save(recipe);
            for (const ingredient of body.recipeIngredients) {
                const recipeIngredient = recipeIngredientRepository.create({
                    recipe,
                    ingredient,
                    quantity: ingredient.quantity
                });
                await recipeIngredientRepository.save(recipeIngredient);
            }
            return {
                response: JSON.stringify(recipe),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async deleteRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const deleteRecipeBody = await readBody(req);
        if (!deleteRecipeBody?.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            await Database.createQueryBuilder().delete().from('Recipe').where('id = :id', { id: deleteRecipeBody.id }).execute();
            return {
                response: '200 OK',
                header: 'text/plain',
                status: 200
            }
        }).catch(async error => {
            console.log(error);
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async updateRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const updateRecipeBody = await readBody(req);
        if (!updateRecipeBody.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipe = await recipeRepository.findOneBy({id:updateRecipeBody.id});
            if (!recipe) {
                throw 'Recipe not found';
            }
            recipe.name = updateRecipeBody.name ?? recipe.name;
            recipe.description = updateRecipeBody.description ?? recipe.description;
            recipe.skillCheck = updateRecipeBody.skillCheck ?? recipe.skillCheck;
            recipe.benefits = updateRecipeBody.benefits ?? recipe.benefits;
            recipe.downside = updateRecipeBody.downside ?? recipe.downside;
            recipe.isHidden = updateRecipeBody.isHidden ?? recipe.isHidden;
            await recipeRepository.save(recipe);
            return {
                response: JSON.stringify(recipe),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            console.log(error);
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }
}

class RecipeList extends Recipe {
    canMake: boolean = false;
    recipeIngredients: RecipeIngredientList[] = [];
}
class RecipeIngredientList extends RecipeIngredient {
    have: number = 0;
}