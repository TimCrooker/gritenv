import { createPrompt } from '.'

describe('Create prompts', () => {
	it('input', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			default: 'default',
		}
		const promptOut = createPrompt.input(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'input',
		})
	})

	it('password', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			mask: '*',
			default: 'default',
		}
		const promptOut = createPrompt.password(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'password',
		})
	})

	it('number', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			default: 1,
		}
		const promptOut = createPrompt.number(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'number',
		})
	})

	it('confirm', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			default: true,
		}
		const promptOut = createPrompt.confirm(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'confirm',
		})
	})

	it('checkbox', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			choices: [
				{
					name: 'name',
					value: 'value',
					short: 'hello world',
					checked: true,
				},
				{ name: 'name', value: 'value', short: 'hello world', checked: false },
			],
		}
		const promptOut = createPrompt.checkbox(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'checkbox',
		})
	})

	it('list', () => {
		const prompt = {
			name: 'name',
			message: 'message',
			choices: [
				{ name: 'name', value: 'value', short: 'hello world' },
				{ name: 'name', value: 'value', short: 'hello world' },
			],
		}

		const promptOut = createPrompt.list(prompt)

		expect(promptOut).toEqual({
			...prompt,
			type: 'list',
		})
	})
})
