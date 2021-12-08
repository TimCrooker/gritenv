import { BasePrompt, WithAnswers } from '..'

export interface ConfirmPrompt extends BasePrompt {
	type: 'confirm'
	mock?: boolean
	plugin?: boolean
	default?: WithAnswers<boolean>
}
