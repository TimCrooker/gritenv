import Separator from 'inquirer/lib/objects/separator'
import { CheckboxChoice } from './checkbox'
import { ListChoice } from './list'

export type Choice = number | string | ListChoice | CheckboxChoice

export type Choices = Array<Choice | Separator>

/**
 * Represents a choice-item.
 */
interface ChoiceBase {
	/**
	 * The type of the choice.
	 */
	type?: string | undefined
}

/**
 * Provides options for a choice.
 */
export interface ChoiceOptions extends ChoiceBase {
	/**
	 * @inheritdoc
	 */
	type?: 'choice' | undefined

	/**
	 * The name of the choice to show to the user.
	 */
	name: string

	/**
	 * The value of the choice.
	 */
	value: any

	/**
	 * The short form of the name of the choice.
	 */
	short?: string | undefined

	/**
	 * The extra properties of the choice.
	 */
	extra?: any
}
