import IngredientController from 'controllers/ingredientController';
import InventoryController from 'controllers/inventoryController';
import RecipeController from 'controllers/recipeController';
import http from 'http';

export default class Routes {
    constructor(
        public req: http.IncomingMessage, 
        public res: http.ServerResponse
    ) {
        this.url = req.url?.replace(/\/data\//, '/') ?? '';
    }

    @Method('GET')
    private ['/get-recipes'](req: http.IncomingMessage, res: http.ServerResponse) {
        return RecipeController.getRecipes(req, res)
    }

    @Method('GET')
    private ['/get-ingredients'](req: http.IncomingMessage, res: http.ServerResponse) {
        return IngredientController.getIngredients(req, res);
    }

    @Method('POST')
    private ['/add-ingredient'](req: http.IncomingMessage, res: http.ServerResponse) {
        return IngredientController.addIngredient(req, res);
    }

    @Method('DELETE')
    private ['/delete-ingredient'](req: http.IncomingMessage, res: http.ServerResponse) {
        return IngredientController.deleteIngredient(req, res);
    }

    @Method('POST')
    private ['/add-recipe'](req: http.IncomingMessage, res: http.ServerResponse) {
        return RecipeController.addRecipe(req, res);
    }

    @Method('DELETE')
    private ['/delete-recipe'](req: http.IncomingMessage, res: http.ServerResponse) {
        return RecipeController.deleteRecipe(req, res);
    }

    @Method('GET')
    private ['/get-inventory'](req: http.IncomingMessage, res: http.ServerResponse) {
        return InventoryController.getInventory();
    }

    @Method('PUT')
    private ['/update-recipe'](req: http.IncomingMessage, res: http.ServerResponse) {
        return RecipeController.updateRecipe(req, res);
    }

    @Method('PUT')
    private ['/update-recipe-ingredient'](req: http.IncomingMessage, res: http.ServerResponse) {
        return IngredientController.updateRecipeIngredient(req, res);
    }

    get response() {
        if (this.url === '' || this[this.url] === undefined) return {
            response: '404 Not Found',
            header: 'text/plain',
            status: 404
        }
        return this[this.url](this.req, this.res);
    }
    [key: string]: any;
}

function Method(method: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function(req: http.IncomingMessage, res: http.ServerResponse) {
            if (req.method !== method) {
                return {
                    response: '405 Method Not Allowed',
                    header: 'text/plain',
                    status: 405
                }
            } else {
                return originalMethod.call(this, req, res);
            }
        }
    }
}