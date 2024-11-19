import http from "http";
import { Database, Log } from "services";
import { readBody } from "../main";

const ingredientRepository = Database.getRepository('Ingredient');
const recipeRepository = Database.getRepository('Recipe');
const recipeIngredientRepository = Database.getRepository('RecipeIngredient');

export default class IngredientController {
    static async getIngredients(req: http.IncomingMessage, res: http.ServerResponse) {
        return Database.initialize().then(async () => {
            const ingredients = await ingredientRepository.find();
            return {
                response: JSON.stringify(ingredients),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            error = JSON.stringify(error);
            Log.write(error);
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async addIngredient(req: http.IncomingMessage, res: http.ServerResponse) {
        const body = await readBody(req);
        if (
            !body.recipeId || !body.ingredientName || !body.ingredientQuantity || !body.ingredientDescription ||
            !(typeof body.recipeId === 'string') || !(typeof body.ingredientName === 'string') || !(typeof body.ingredientQuantity === 'string') || !(typeof body.ingredientDescription === 'string')
        ) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipe = await recipeRepository.findOneBy({id:body.recipeId});
            let ingredient = await ingredientRepository.findOneBy({name:body.ingredientName});
            if (!ingredient)
            ingredient = ingredientRepository.create({
                name: body.ingredientName,
                description: body.ingredientDescription
            });
            await ingredientRepository.save(ingredient);
            const recipeIngredient = recipeIngredientRepository.create({
                recipe,
                ingredient,
                quantity: body.ingredientQuantity
            });
            await recipeIngredientRepository.save(recipeIngredient);
            return {
                response: JSON.stringify(recipeIngredient),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            error = JSON.stringify(error);
            Log.write(error);
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async deleteIngredient(req: http.IncomingMessage, res: http.ServerResponse) {
        const deleteBody: any = await readBody(req);
        if (!deleteBody.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {;
            await Database.createQueryBuilder().delete().from('RecipeIngredient').where('id = :id', { id: deleteBody.id }).execute();
            return {
                response: '200 OK',
                header: 'text/plain',
                status: 200
            }
        }).catch(async error => {
            error = JSON.stringify(error);
            Log.write(error);
            return {
                response: error,
                header: 'text/plain',
                status: 500
            }
        }).finally(async () => {
            await Database.destroy();
        });
    }

    static async updateRecipeIngredient(req: http.IncomingMessage, res: http.ServerResponse) {
        const updateRecipeIngredientBody = await readBody(req);
        if (!updateRecipeIngredientBody.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipeIngredient = await recipeIngredientRepository.findOneBy({id:updateRecipeIngredientBody.id});
            if (!recipeIngredient) {
                throw 'RecipeIngredient not found';
            }
            recipeIngredient.quantity = updateRecipeIngredientBody.quantity ?? recipeIngredient.quantity;
            await recipeIngredientRepository.save(recipeIngredient);
            return {
                response: JSON.stringify(recipeIngredient),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            error = JSON.stringify(error);
            Log.write(error);
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