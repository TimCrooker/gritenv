import { logger, colors } from 'swaglog'
import { spinner } from './spinner'

export class GritError extends Error {
	grit: boolean
	cmdOutput?: string

	constructor(message: string) {
		super(message)
		this.grit = true
		this.name = this.constructor.name
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor)
		} else {
			this.stack = new Error(message).stack
		}
	}
}

export function handleError(error: Error | GritError): void {
	spinner.stop()
	if (error instanceof GritError) {
		if (error.cmdOutput) {
			console.error(error.cmdOutput)
		}
		logger.error(error.message)
		logger.debug(colors.dim(error.stack))
	} else if (error.name === 'CACError') {
		logger.error(error.message)
	} else {
		logger.error(error.stack)
	}
	process.exit(1)
}
