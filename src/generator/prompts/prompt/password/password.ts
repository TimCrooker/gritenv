import { BasePrompt, WithAnswers, WithFullContext } from '..'

export interface PasswordPrompt extends BasePrompt {
	type: 'password'
	mask: string
	mock?: string
	default?: WithAnswers<string>
	validate?: WithFullContext<string, boolean | string>
	filter?: WithFullContext<string, string>
}
