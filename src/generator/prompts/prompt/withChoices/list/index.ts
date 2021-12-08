import { DynamicQuestionProperty } from 'inquirer'
import { ChoiceOptions } from '..'
import { Answers, BasePrompt, WithAnswers, WithFullContext } from '../..'

export interface ListPrompt extends BasePrompt {
	type: 'list' | 'rawlist'
	mock?: string
	plugin?: boolean
	choices: WithAnswers<ListChoice[]>
	/** Must be the index or value of desired choice */
	default?: WithAnswers<number | string>
	filter?: WithFullContext<unknown, string>
	loop?: boolean
}

/** Choice for list style prompts */
export interface ListChoice<T extends Answers = Answers> extends ChoiceOptions {
	/**
	 * A value indicating whether the choice is disabled.
	 */
	disabled?: DynamicQuestionProperty<boolean | string, T> | undefined
}
