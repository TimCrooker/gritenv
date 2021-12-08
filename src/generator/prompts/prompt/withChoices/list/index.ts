import { DynamicQuestionProperty } from 'inquirer'
import { ChoiceOptions } from '..'
import { Answers, BasePrompt, WithAnswers, WithFullContext } from '../..'

/*********************TYPES**********************/

interface ListPrompt extends BasePrompt {
	type: 'list' | 'rawlist'
	mock?: string
	plugin?: boolean
	choices: WithAnswers<ListChoice[]>
	/** Must be the index or value of desired choice */
	default?: WithAnswers<number | string>
	filter?: WithFullContext<unknown, string>
	loop?: boolean
}

/*********************METHODS**********************/

/** Choice for list style prompts */
interface ListChoice<T extends Answers = Answers> extends ChoiceOptions {
	/**
	 * A value indicating whether the choice is disabled.
	 */
	disabled?: DynamicQuestionProperty<boolean | string, T> | undefined
}

/*********************EXPORTS**********************/

export { ListPrompt, ListChoice }
