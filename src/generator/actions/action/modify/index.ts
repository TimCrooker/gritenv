import { majo } from 'majo'
import path from 'path'
import { logger } from 'swaglog'
import { ActionFn } from '../../runAction'

/*********************TYPES**********************/

interface ModifyAction {
	type: 'modify'
	/** Glob patterns to target files inside of the project directory for manipulation */
	files: string | string[]
	/**
	 * A function that will be called on each file that matches the glob pattern.
	 *
	 * @param data the contents of the file to modify (JSON object if `filePath` is .json)
	 *
	 * @param filePath: The relative path to the file that matched the glob pattern
	 */
	handler: (data: Record<string, any> | string, filepath: string) => any
}

/*********************METHODS**********************/

const modifyAction: ActionFn<ModifyAction> = async (context, action) => {
	const stream = majo()
	stream.source(action.files, { baseDir: context.opts.outDir })
	stream.use(async ({ files }) => {
		await Promise.all(
			// eslint-disable-next-line array-callback-return
			Object.keys(files).map(async (relativePath) => {
				const isJson = relativePath.endsWith('.json')
				let contents = stream.fileContents(relativePath)
				if (isJson) {
					contents = JSON.parse(contents)
				}
				let result = await action.handler(contents, relativePath)
				if (isJson) {
					result = JSON.stringify(result, null, 2)
				}
				stream.writeContents(relativePath, result)
				logger.fileAction(
					'yellow',
					'Modified',
					path.join(context.opts.outDir, relativePath)
				)
			})
		)
	})
	await stream.dest(context.opts.outDir)
}

/*********************EXPORTS**********************/

export { modifyAction, ModifyAction }
