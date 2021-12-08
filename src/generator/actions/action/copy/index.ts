import { glob } from 'majo'
import path from 'path'
import { logger } from 'swaglog'
import { copy } from 'youtill'
import { ActionFn } from '../../runAction'

/*********************TYPES**********************/

/** Copy files */
interface CopyAction {
	type: 'copy'
	/**
	 *	Patterns object represents mappings for the source and destination files
	 *
	 *	key is the source file's relative filePath
	 *
	 * 	value is the new file's relative filePath
	 *
	 *	Copy to new dir: {'sourceDir/file.js': 'newDir/file.js'}
	 *
	 *	Copy and rename in same dir: {'sourceDir/file.js': 'sourceDir/newFile.js'}
	 */
	patterns: {
		[k: string]: string
	}
	/**
	 * should this action overwrite existing files
	 *
	 * default: true
	 */
	overwrite?: boolean
}

/*********************METHODS**********************/

const copyAction: ActionFn<CopyAction> = async (context, action) => {
	await Promise.all(
		Object.keys(action.patterns).map(async (pattern) => {
			const files = await glob(pattern, {
				cwd: context.outDir,
				absolute: true,
				onlyFiles: false,
			})
			if (files.length > 1) {
				throw new Error('"copy" pattern can only match one file!')
			} else if (files.length === 1) {
				const from = files[0]
				const to = path.join(context.outDir, action.patterns[pattern])
				await copy(from, to, {
					overwrite: action.overwrite ?? true,
				})
				logger.fileCopyAction(from, to)
			}
		})
	)
}

/*********************EXPORTS**********************/

export { copyAction, CopyAction }
