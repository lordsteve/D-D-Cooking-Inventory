import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { RecipeIngredient } from "./RecipeIngredient"

@Entity()
export class Recipe {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    description!: string

    @Column()
    skillCheck!: string

    @Column()
    benefits!: string

    @Column()
    downside!: string

    @Column()
    isHidden!: boolean

    @OneToMany(() => RecipeIngredient, recipeToIngredient => recipeToIngredient.recipe, {
        eager: true, 
        cascade: true
    })
    @JoinTable()
    recipeIngredients!: RecipeIngredient[]

}