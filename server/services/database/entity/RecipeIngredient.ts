import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, JoinTable } from 'typeorm';
import { Ingredient } from './Ingredient';
import { Recipe } from './Recipe';

@Entity()
export class RecipeIngredient {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public recipeId!: number;

    @Column()
    public ingredientId!: number;

    @Column()
    public quantity!: number;

    @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients)
    @JoinTable()
    public recipe!: Recipe;

    @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, {eager: true})
    @JoinTable()
    public ingredient!: Ingredient;
}