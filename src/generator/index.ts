import { exec } from 'child_process'
import spawn from 'cross-spawn'
import { glob } from 'majo'
import { tmpdir } from 'os'
import path from 'path'
import { SetRequired } from 'type-fest'
import { promisify } from 'util'
import { GritError } from '@/utils/error'
import { getGitUser, GitUser } from '@/utils/git-user'
import { Prompt, Prompts } from './prompts'
import { Action, Actions } from './actions'
import { Data } from './data'
import { Completed } from './completed'
import { Prepare } from './prepare'
import { Plugins } from './plugins'
import { Answers } from './prompts/prompt'
import pkg from '@/../package.json'
import chokidar from 'chokidar'
import {
	getNpmClient,
	InstallOptions,
	installPackages,
	NPM_CLIENT,
	pathExists,
	readFile,
	requireUncached,
} from 'youtill'
import { colors, logger } from 'swaglog'
import { spinner } from '@/utils/spinner'
import { GeneratorConfig } from './generatorConfig'
import {
	NpmGenerator,
	ParsedGenerator,
	parseGenerator,
	RepoGenerator,
} from './parseGenerator'
import { store } from '@/store'

export interface GritOptions {
	/**
	 * Name of directory to output to or relative path to it
	 * Will be created if it does not alreadt exist.
	 * Defaults to the current working directory.
	 */
	outDir?: string
	/**
	 *  Controls the level of logging that is shown in the console.
	 *	1: Errors and success messages only
	 *	2: Errors and warnings
	 *	3: Errors, warnings and info
	 *	4: Errors, warnings, info and debug
	 */
	logLevel?: 1 | 2 | 3 | 4
	/**
	 * Sets logLevel to 4
	 * prevents dependency installation prevents
	 * prevents git init
	 */
	debug?: boolean
	/** Least amount of logging to the console */
	silent?: boolean
	/** generator string */
	config: GeneratorConfig
	/** generator information */
	generator: ParsedGenerator | string
	/** Use `git clone` to download repo */
	clone?: boolean
	/** Use a custom npm registry */
	registry?: string
	/**
	 * Setting this to true will enable hot reloading
	 * whenever you make changes to the source files of a local generator
	 * the project will rebuild automatically and reinstall dependencies if necessary
	 *
	 * This is useful for development and testing of generators
	 */
	hotRebuild?: boolean
	/**
	 * Mock git info, prompts etc
	 * Additionally, Set ENV variable NODE_ENV to test to enable this
	 */
	mock?: boolean
	/**
	 * User-supplied answers to prompts
	 */
	answers?: Answers | string
}

const IDLE = 'idle'
const PREPARE = 'prepare'
const POST_PREPARE = 'post-prepare'
const PROMPT = 'prompt'
const POST_PROMPT = 'post-prompt'
const DATA = 'data'
const POST_DATA = 'post-data'
const ACTIONS = 'action'
const POST_ACTIONS = 'post-actions'
const COMPLETE = 'complete'
const FINISHED = 'completed'

/*********************TYPES**********************/

type GenState =
	| typeof IDLE
	| typeof PREPARE
	| typeof POST_PREPARE
	| typeof PROMPT
	| typeof POST_PROMPT
	| typeof DATA
	| typeof POST_DATA
	| typeof ACTIONS
	| typeof POST_ACTIONS
	| typeof COMPLETE
	| typeof FINISHED

type StatefulMethod = (context: Grit) => Promise<void> | void

type StatefulMethods = Record<GenState, StatefulMethod[]>

/*********************METHODS**********************/

class Grit {
	opts: SetRequired<GritOptions, 'outDir' | 'logLevel' | 'mock' | 'debug'>
	/** Use a console spinner to make asyncronous calls more user friendly */
	spinner = spinner
	/** Colorize your console output */
	colors = colors
	/** Log to the console with Grit */
	logger = logger
	/** information about the current generator */
	generator: ParsedGenerator

	// generator runtime environment instances
	/** Runs operations inside the prepare section of a generator */
	private prepare: Prepare
	/** Runs operations inside the prompts section of a generator */
	private _prompts: Prompts
	/** Runs operations inside the data section of a generator */
	private _data: Data
	/** Runs operations inside the actions section of a generator */
	private _actions: Actions
	/** Runs operations inside the data section of a generator */
	private completed: Completed

	private plugins?: Plugins
	private rebuilding = false
	private _state: GenState = IDLE
	private statefulMethods: StatefulMethods = {
		[IDLE]: [],
		[PREPARE]: [],
		[POST_PREPARE]: [],
		[PROMPT]: [],
		[POST_PROMPT]: [],
		[DATA]: [],
		[POST_DATA]: [],
		[ACTIONS]: [],
		[POST_ACTIONS]: [],
		[COMPLETE]: [],
		[FINISHED]: [],
	}

	constructor(opts: GritOptions) {
		this.opts = {
			...opts,
			outDir: path.resolve(opts.outDir || '.'),
			logLevel: opts.logLevel || 3,
			hotRebuild:
				typeof opts.hotRebuild === 'boolean' ? opts.hotRebuild : false,
			mock: typeof opts.mock === 'boolean' ? opts.mock : false,
			debug: typeof opts.debug === 'boolean' ? opts.debug : false,
		}

		if (typeof this.opts.answers === 'string') {
			this.opts.answers = JSON.parse(this.opts.answers)
		}

		// Set log level from run mode
		if (opts.debug) {
			this.opts.logLevel = 4
		} else if (opts.silent) {
			this.opts.logLevel = 1
		}

		if (!opts.outDir) {
			logger.warn(
				'You have not supplied a project directory. The project will be built in your current directory'
			)
		}
		// configure logger
		logger.setOptions({
			logLevel: this.opts.logLevel,
			mock: this.opts.mock,
		})

		// redirect outDir to temp dir when mock mode is enabled
		if (this.opts.mock) {
			this.opts.debug = true
			this.opts.outDir = path.join(tmpdir(), `grit-out/${Date.now()}/out`)
		}

		// use directly passed parsed generator or parse generator string
		if (typeof opts.generator === 'string') {
			this.generator = parseGenerator(this.opts.generator as string)
		} else {
			this.generator = this.opts.generator as NpmGenerator | RepoGenerator
		}

		// Instantiate generator runtime environments
		this.prepare = new Prepare(this)
		this._prompts = new Prompts(this)
		this._data = new Data(this)
		this._actions = new Actions(this)
		this.completed = new Completed(this)
	}

	/*********************INTERNAL METHODS**********************/

	/**
	 * Run the generator with the configured options
	 * Execures the prepare, prompt, data, actions, and completed sections of a generator config file
	 */
	async runGenerator(
		config: GeneratorConfig = this.opts.config
	): Promise<void> {
		if (config.description) {
			logger.status('green', 'Generator', config.description)
		}

		// Run generator prepare
		if (config.prepare) {
			this.state = PREPARE
			await this.prepare.run()
			this.state = POST_PREPARE
		}

		// Run generator prompt section
		if (config.prompts) {
			this.state = PROMPT
			await this._prompts.run()
			this.state = POST_PROMPT
		}

		// load create a new plugins runner and load them if they are being used
		this.plugins = await new Plugins({
			selectedPlugins: this.data.selectedPlugins,
			context: this,
		}).loadPlugins()
		// Register the plugin data provider
		this._data.registerDataProvider(await this.plugins.addPluginData())
		// if there are selected plugins, then register the plugins action provider
		this._actions.registerActionProvider(await this.plugins.addPluginActions())

		// Run generator data section
		this.state = DATA
		await this._data.run()
		this.state = POST_DATA

		// Run generator actions section
		if (config.actions) {
			this.state = ACTIONS
			await this._actions.run()
			this.state = POST_ACTIONS
		}

		// Run generator completed section
		if (!this.opts.mock && config.completed) {
			this.state = COMPLETE
			await this.completed.run()
			this.state = FINISHED
		}
	}

	/**
	 * Method to run when instantiated with a generator
	 */
	async run(): Promise<this> {
		// Increment the run count of the generator in the store
		store.generators.set(
			this.generator.hash + '.runCount',
			store.generators.get(this.generator.hash + '.runCount') + 1 || 1
		)

		if (this.opts.hotRebuild === true) {
			await this.runHotRebuild()
		} else {
			await this.runGenerator()
		}
		return this
	}

	/**
	 * Run the generator in hot rebuild mode
	 */
	async runHotRebuild(): Promise<void> {
		// run the project as normal one time
		await this.runGenerator()

		// exit if the generator is not local
		if (this.generator.type !== 'local') {
			logger.warn('Cannot run hot rebuild on a non-local generator')
			return
		}

		// set the watcher to the files in the generator
		const watchItems: string[] = []
		if (this.plugins && this.plugins.selectedPlugins.length > 0) {
			watchItems.push(this.plugins.pluginsDir)
		}
		watchItems.push(
			path.resolve(
				this.generator.path,
				this.opts.config.templateDir || 'template'
			)
		)

		// silence logging on rebuild unless specifically in debug mode
		if (this.opts.debug) this.logger.options.logLevel = 1

		// watch the plugins directory for changes and run the generator again
		logger.info('Watching for changes...')
		const watcher = chokidar.watch(watchItems, {
			persistent: true,
			ignoreInitial: true,
		})

		watcher.on('all', async (event, filePath) => {
			this.rebuilding = true

			spinner.start('changes detected... rebuilding generator')

			// set injected answers to the automatically use the answers from the last run
			this.opts.answers = this.answers

			try {
				// run the generator again
				await this.runGenerator()

				// install new packages if the package.json file was updated
				if (path.basename(filePath) === 'package.json') {
					await this.npmInstall()
				}

				spinner.succeed('generator rebuilt')
			} catch (err) {
				spinner.fail('generator rebuild failed')
				logger.error('Rebuild encountered the following error:', err)
			}

			logger.info('watching for changes...')
		})
	}

	/**
	 * Block execution for inside generator runtimes for particular states
	 * Will throw an error if access is blocked
	 *
	 * @param accessItem name of the item attempting to be accessed
	 * @param denyStates states in which access is denied
	 * @param allowStates states in which access is exclusivly allowed
	 */
	private setPermissions(
		accessItem: string,
		denyStates?: string[],
		allowStates?: string[]
	): void {
		// Check if the current state is one of the denied states
		if (denyStates && denyStates.includes(this.state)) {
			throw new Error(
				`You cannot access ${accessItem} in the ${this.state} section`
			)
		}

		// Check if the current state is one of the allowed states
		if (allowStates && !allowStates.includes(this.state)) {
			throw new Error(
				`You cannot access ${accessItem} in the ${this.state} section`
			)
		}

		return
	}

	/*********************GENERATOR AVAILIABLE PROPERTIES**********************/

	/**
	 * Retrive the answers
	 *
	 * You can't access this in `prompts` function
	 */
	get answers(): Answers {
		this.setPermissions('answers', [PROMPT])
		return this._prompts.answers
	}

	set answers(value: Answers) {
		this._prompts.answers = value
	}

	/**
	 * The combination of answers and data from the data generator methods
	 *
	 * Used to give generator functions more custom data to work with
	 */
	get data(): Answers {
		this.setPermissions('data', [PREPARE, PROMPT])
		return {
			...this.answers,
			...this._data.data,
		}
	}

	set data(value: Answers) {
		this._data.data = value
	}

	get prompts(): Prompt[] {
		return this._prompts.prompts
	}

	get actions(): Action[] {
		return this._actions.actions
	}

	get state(): GenState {
		return this._state
	}

	set state(newState: GenState) {
		this._state = newState

		// execute all of the functions in statefulMethods for the new state
		this.statefulMethods[newState].forEach((method) => method(this))
	}

	/**
	 * Read package.json from output directory
	 *
	 * Returns an empty object when it doesn't exist
	 */
	get pkg(): Record<string, any> | undefined {
		try {
			return requireUncached(path.resolve(this.outDir, 'package.json'))
		} catch (err) {
			return undefined
		}
	}

	get generatorPkg(): Record<string, any> {
		try {
			return require(path.resolve(this.generator.path, 'package.json'))
		} catch (err) {
			return {}
		}
	}

	get gritPkg(): Record<string, any> {
		return pkg
	}

	/**
	 *  Get the information of system git user
	 */
	get gitUser(): GitUser {
		return getGitUser(this.opts.mock)
	}

	/**
	 *  The basename of output directory
	 */
	get projectName(): string {
		return path.basename(this.opts.outDir)
	}

	get templateDirPath(): string {
		return path.join(
			this.generator.path,
			this.opts.config.templateDir || 'template'
		)
	}

	/**
	 * The absolute path to output directory
	 */
	get outDir(): string {
		return path.resolve(this.opts.outDir)
	}

	/** The npm client */
	get npmClient(): NPM_CLIENT {
		return getNpmClient()
	}

	/*********************GENERATOR AVAILIABLE METHODS**********************/

	/** Add a method that will run when the generator reached the specified state */
	setStatefulMethod(state: GenState, method: StatefulMethod): void {
		this.statefulMethods[state].push(method)
	}

	/**
	 * 	Run `git init` in output directly
	 */
	gitInit(): void {
		this.setPermissions('gitInit', [], [COMPLETE])
		if (this.opts.mock || this.opts.debug || this.opts.hotRebuild) {
			logger.debug('Skipping git init')
			return
		}

		const ps = spawn.sync('git', ['init'], {
			stdio: 'ignore',
			cwd: this.outDir,
		})
		if (ps.status === 0) {
			logger.success('Initialized empty Git repository')
		} else {
			logger.debug(`git init failed in ${this.outDir}`)
		}
	}

	/**
	 * Run a git commit with a custom commit message in output directory
	 */
	async gitCommit(commitMessage?: string): Promise<void> {
		this.setPermissions('gitInit', [], [COMPLETE])
		if (this.opts.mock || this.opts.debug || this.opts.hotRebuild) {
			logger.debug('Skipping git commit')
			return
		}

		const outDir = this.outDir

		try {
			// add
			await promisify(exec)(
				`git --git-dir="${outDir}"/.git/ --work-tree="${outDir}"/ add -A`
			)
			// commit
			await promisify(exec)(
				`git --git-dir="${outDir}"/.git/ --work-tree="${outDir}"/ commit -m "${
					commitMessage || 'Commit'
				}"`
			)
			logger.success('created a git commit.')
		} catch (err) {
			logger.debug('An error occured while creating git commit', err)
		}
	}

	/** Run `npm install` in output directory */
	async npmInstall(
		opts?: Omit<InstallOptions, 'cwd' | 'registry'>
	): Promise<{ code: number }> {
		this.setPermissions('gitInit', [], [COMPLETE])
		if (this.opts.mock || this.opts.debug) {
			logger.debug('npm install skipped')
			return { code: 0 }
		}

		return installPackages(
			Object.assign(
				{
					registry: this.opts.registry,
					cwd: this.outDir,
				},
				opts
			)
		)
	}

	/** Display a success message */
	showProjectTips(): void {
		this.setPermissions('gitInit', [], [COMPLETE])
		spinner.stop() // Stop when necessary
		logger.success(`Generated into ${colors.underline(this.outDir)}`)
	}

	/**
	 * Create an Grit Error so we can pretty print the error message instead of showing full error stack
	 */
	createError(message: string): GritError {
		return new GritError(message)
	}

	/*********************TESTING HELPERS**********************/

	/**
	 * Get file list of output directory
	 */
	async getOutputFiles(): Promise<string[]> {
		const files = await glob(['**/*', '!**/node_modules/**', '!**/.git/**'], {
			cwd: this.opts.outDir,
			dot: true,
			onlyFiles: true,
		})
		return files.sort()
	}

	/**
	 * Check if a file exists in output directory
	 */
	async hasOutputFile(file: string): Promise<boolean> {
		return await pathExists(path.join(this.opts.outDir, file))
	}

	/**
	 *  Read a file in output directory
	 */
	async readOutputFile(file: string): Promise<string | Record<string, any>> {
		const contents = await readFile(path.join(this.opts.outDir, file), 'utf8')
		if (file.endsWith('.json')) {
			return JSON.parse(contents)
		}
		return contents
	}
}

/*********************EXPORTS**********************/

export { Grit }
