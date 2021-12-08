import { BasePrompt, WithAnswers, WithFullContext } from '..'

export interface NumberPrompt extends BasePrompt {
	type: 'number'
	mock?: number
	default?: WithAnswers<number>
	validate?: WithFullContext<number, boolean | string>
	filter?: WithFullContext<number, string>
}
