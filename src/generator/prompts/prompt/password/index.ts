import { BasePrompt, WithAnswers, WithFullContext } from '..'

/*********************TYPES**********************/

interface PasswordPrompt extends BasePrompt {
	type: 'password'
	mask: string
	mock?: string
	default?: WithAnswers<string>
	validate?: WithFullContext<string, boolean | string>
	filter?: WithFullContext<string, string>
}

/*********************EXPORTS**********************/

export { PasswordPrompt }
