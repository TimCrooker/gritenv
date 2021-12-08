import { BasePrompt, WithAnswers, WithFullContext, Answers } from '../..'
import { ListChoice } from '../list'

export interface CheckboxPrompt extends BasePrompt {
	type: 'checkbox'
	plugin?: boolean
	mock?: Array<string>
	choices: WithAnswers<CheckboxChoice[]>
	default?: WithAnswers<string[]>
	validate?: WithFullContext<string, boolean | string>
	filter?: WithFullContext<unknown, Array<string>>
}

/**
 * Provides options for a choice of the `CheckboxPrompt`.
 */
export interface CheckboxChoice<T extends Answers = Answers>
	extends ListChoice<T> {
	/**
	 * A value indicating whether the choice should be initially checked.
	 */
	checked?: boolean | undefined
}
