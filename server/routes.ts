import http from 'http';
import RecipeController from './controllers/recipeController';
import IngredientController from 'controllers/ingredientController';
import InventoryController from 'controllers/inventoryController';

export default async function routes(req: http.IncomingMessage, res: http.ServerResponse) {
        const url = req.url?.replace(/\/data\//, '/');
        if (!url) {
            return {
                response: '404 Not Found',
                header: 'text/plain',
                status: 404
            }
        }

        switch (url) {
            case '/get-recipes':
                if (req.method !== 'GET') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return RecipeController.getRecipes(req, res);
            case '/get-ingredients':
                if (req.method !== 'GET') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return IngredientController.getIngredients(req, res);
            case '/add-ingredient':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return IngredientController.addIngredient(req, res);
            case '/delete-ingredient':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return IngredientController.deleteIngredient(req, res);
            case '/add-recipe':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return RecipeController.addRecipe(req, res);
            case '/delete-recipe':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return RecipeController.deleteRecipe(req, res);
            case '/get-inventory':
                if (req.method !== 'GET') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return InventoryController.getInventory();
            case '/update-recipe':
                if (req.method !== 'PUT') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return RecipeController.updateRecipe(req, res);
            case '/update-recipe-ingredient':
                if (req.method !== 'PUT') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                return IngredientController.updateRecipeIngredient(req, res);
            default:
                return {
                    response: '404 Not Found',
                    header: 'text/plain',
                    status: 404
                }
        }
}
