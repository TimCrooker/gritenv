import {
	CheckboxPrompt,
	ConfirmPrompt,
	InputPrompt,
	ListPrompt,
	NumberPrompt,
	PasswordPrompt,
	Prompt,
} from '../prompt'

export type RemovePromptType<T extends Prompt> = Omit<T, 'type'>

/** Simple type-safe creation of prompts */
export const createPrompt = {
	input(action: RemovePromptType<InputPrompt>): InputPrompt {
		return {
			...action,
			type: 'input',
		}
	},

	password(action: RemovePromptType<PasswordPrompt>): PasswordPrompt {
		return {
			...action,
			type: 'password',
		}
	},

	number(action: RemovePromptType<NumberPrompt>): NumberPrompt {
		return {
			...action,
			type: 'number',
		}
	},

	confirm(action: RemovePromptType<ConfirmPrompt>): ConfirmPrompt {
		return {
			...action,
			type: 'confirm',
		}
	},

	checkbox(action: RemovePromptType<CheckboxPrompt>): CheckboxPrompt {
		return {
			...action,
			type: 'checkbox',
		}
	},

	list(action: RemovePromptType<ListPrompt>): ListPrompt {
		return {
			...action,
			type: 'list',
		}
	},
}
