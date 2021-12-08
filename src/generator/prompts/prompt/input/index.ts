import { BasePrompt, WithAnswers, WithFullContext } from '..'

/*********************TYPES**********************/

interface InputPrompt extends BasePrompt {
	type: 'input'
	mock?: string
	default?: WithAnswers<string>
	validate?: WithFullContext<string, boolean | string>
	filter?: WithFullContext<string, string>
}

/*********************EXPORTS**********************/

export { InputPrompt }
