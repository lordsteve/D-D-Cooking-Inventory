export class Recipe {
    public id!: number
    public name!: string
    public description!: string
    public recipeIngredients!: RecipeIngredient[]
}

export class RecipeIngredient {
    public id!: number
    public quantity!: number
    public ingredient!: Ingredient
}

export class Ingredient {
    public id!: number
    public name!: string
    public description!: string
}