import { BasePrompt, WithAnswers } from '..'

/*********************TYPES**********************/

interface ConfirmPrompt extends BasePrompt {
	type: 'confirm'
	mock?: boolean
	plugin?: boolean
	default?: WithAnswers<boolean>
}

/*********************EXPORTS**********************/

export { ConfirmPrompt }
