import { GeneratorConfig, Grit } from '@/index'
import { logger } from 'swaglog'
import { mergeObjects } from 'youtill'
import {
	AddAction,
	CopyAction,
	ModifyAction,
	MoveAction,
	RemoveAction,
} from './action'
import { createAction, RemoveActionType } from './createAction'
import { runAction } from './runAction'

/*********************TYPES**********************/

type ActionProvider = (context: Grit) => Promise<Action[]> | Action[]

type Action = AddAction | MoveAction | CopyAction | ModifyAction | RemoveAction

/*********************METHODS**********************/

class Actions {
	private _actions: Action[] = []
	private context: Grit
	private actionProviders: ActionProvider[] = []

	constructor(context: Grit) {
		this.context = context
	}

	/** Execute the current actions stack */
	async run(grit = this.context): Promise<void> {
		await this.getActions()

		for (const action of this.actions) {
			try {
				await runAction(grit, action)
			} catch (e) {
				logger.error(`Error running action: ${e}`)
			}
		}
	}

	/** Get the actions stack from the generator and any action providers */
	private async getActions(
		context: Grit = this.context,
		config: GeneratorConfig['actions'] = this.context.opts.config.actions
	): Promise<void> {
		// get actions from the generator file
		const configActions =
			typeof config === 'function' ? await config.call(this, context) : config
		if (configActions && configActions.length > 0)
			this.actions.push(...configActions)

		// get actions from any registered action providers
		for (const actionProvider of this.actionProviders) {
			const actions = await actionProvider(context)
			this.actions.push(...actions)
		}
	}

	/**
	 * Register Action providing functions to be executed in the actions section of the generator.
	 * this allows you to hook into the actions section of a generator to add new functionality
	 * without putting it directly inside a gernertor file.
	 */
	registerActionProvider(actionProvider: ActionProvider): void {
		this.actionProviders.push(actionProvider)
	}

	/**
	 * Runtime availiable methods
	 */

	/** Add a action or an array of actions to the generator */
	newAction(action: Action | Action[]): void {
		const validateAndPush = (prompt: Action): void => {
			this._actions.push(prompt)
		}

		if (Array.isArray(action)) {
			action.forEach((prompt) => {
				validateAndPush(prompt)
			})
		} else {
			validateAndPush(action)
		}
	}

	/** Create a new add action and add it to the actions stack */
	add(action: RemoveActionType<AddAction>): this {
		this.newAction(createAction.add(action))
		return this
	}

	/** Create a new move action and add it to the actions stack */
	move(action: RemoveActionType<MoveAction>): this {
		this.newAction(createAction.move(action))
		return this
	}

	/** Create a new copy action and add it to the actions stack */
	copy(action: RemoveActionType<CopyAction>): this {
		this.newAction(createAction.copy(action))
		return this
	}

	/** Create a new modify action and add it to the actions stack */
	modify(action: RemoveActionType<ModifyAction>): this {
		this.newAction(createAction.modify(action))
		return this
	}

	/** Create a new remove action and add it to the actions stack */
	remove(action: RemoveActionType<RemoveAction>): this {
		this.newAction(createAction.remove(action))
		return this
	}

	/** take a JSON file in the destination directory and merge it with a passed object */
	extendJSON(
		filePath: string,
		toMerge: Record<string, any>,
		mergeArrays?: boolean
	): this {
		// throw error when filepath is not a JSON file
		if (!filePath.endsWith('.json')) {
			throw new Error(
				`${filePath} is not a JSON file. Please provide a JSON file path.`
			)
		}

		// Add modify action to merge the passed object with the existing JSON file
		this.modify({
			files: [filePath],
			handler: (data) =>
				mergeObjects(data as Record<string, any>, [toMerge], mergeArrays),
		})

		return this
	}

	get actions(): Action[] {
		return this._actions
	}
}

/*********************EXPORTS**********************/

export { Actions }

export { Action, ActionProvider }

export * from './action'
