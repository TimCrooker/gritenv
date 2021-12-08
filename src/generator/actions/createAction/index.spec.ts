import { createAction } from '.'
import { ModifyAction } from '../action'

describe('Create actions', () => {
	it('add', () => {
		const action = {
			files: ['file.ts'],
			templateDir: './templates',
			filters: { ['**/*.ts']: true, ['**/*.js']: 'false' },
			transform: true,
			transformInclude: ['**/*.ts'],
			transformExclude: ['**/*.js'],
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			data: (context) => ({
				answers: context.answers,
			}),
		}
		const actionOut = createAction.add(action)

		expect(actionOut).toEqual({
			...action,
			type: 'add',
		})
	})

	it('move', () => {
		const action = {
			patterns: { 'path.js': 'file.ts' },
		}
		const actionOut = createAction.move(action)

		expect(actionOut).toEqual({
			...action,
			type: 'move',
		})
	})

	it('copy', () => {
		const action = {
			patterns: { 'path.js': 'file.ts' },
		}
		const actionOut = createAction.copy(action)

		expect(actionOut).toEqual({
			...action,
			type: 'copy',
		})
	})

	it('modify', () => {
		const action = {
			files: ['path.js'],
			handler: (data: Record<string, any>, filepath) => {
				return {
					...data,
					filepath,
				}
			},
		} as ModifyAction
		const actionOut = createAction.modify(action)

		expect(actionOut).toEqual({
			...action,
			type: 'modify',
		})
	})

	// it('merge', () => {
	// 	const action = {
	// 		files: ['path.js'],
	// 		handler: (data: Record<string, any>, filepath) => {
	// 			return {
	// 				...data,
	// 				filepath,
	// 			}
	// 		},
	// 	} as ModifyAction
	// 	const actionOut = createAction.modify(action)

	// 	expect(actionOut).toEqual({
	// 		...action,
	// 		type: 'modify',
	// 	})
	// })

	it('remove', () => {
		const action = {
			files: ['path.js'],
		}
		const actionOut = createAction.remove(action)

		expect(actionOut).toEqual({
			...action,
			type: 'remove',
		})
	})
})
