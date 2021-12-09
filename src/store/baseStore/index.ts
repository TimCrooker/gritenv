import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'
import { mkdirSync } from 'fs'
import dotProp from 'dot-prop'
import path from 'path'
import { ROOT_CACHE_PATH } from '@/config'
import { logger } from 'swaglog'
import { removeFileSync } from 'youtill'

/*********************TYPES**********************/

/**
 * The type of data being stored.
 *
 * This can be as specific or as generic as you want your data to be.
 *
 * Use this when you extend BaseStore to specify the type of data you want to store.
 *
 * @example class MyStore extends BaseStore<StoreFileData<MyDataType>> { }
 */
type StoreFileData<T = any> = Record<string, T>

/** Base store options for instantiation. Meant to be extended for classes implimenting BaseStore */
interface BaseStoreOptions {
	storePath?: string
	storeFileName?: string
}

/*********************METHODS**********************/

/** Abstract class used to build new stores */
abstract class BaseStore<T = any> {
	/** contents of the store file */
	data: StoreFileData<T>
	/** Path to the store directory */
	storePath: string
	/** Path to the store config file */
	storeFilePath: string

	constructor(options?: BaseStoreOptions) {
		this.storePath = options?.storePath || ROOT_CACHE_PATH

		logger.debug('Store path:', this.storePath)

		this.storeFilePath = path.resolve(
			this.storePath,
			options?.storeFileName || 'store.json'
		)

		this.initiateStore()

		this.data = this.read()
	}

	private initiateStore(): void {
		logger.debug('Initializing store directory')
		try {
			mkdirSync(this.storePath, { recursive: true })
		} catch (error) {
			logger.debug(error)
		}
	}

	read(): StoreFileData<T> {
		try {
			return JSON.parse(readFileSync(this.storeFilePath, 'utf8'))
		} catch (_) {
			return {}
		}
	}

	/**
	 * Set an item into the store
	 *
	 * @param overwrite (defaults to true) if set to false, items in the store
	 * are protected from being written to if they already exist
	 */
	set(key: string, value: T | any, overwrite = true): this {
		this.data = this.read()
		const alreadyCached = this.data[key]
		if (alreadyCached && !overwrite) {
			logger.debug('Not overwriting item in cache:', {
				key: alreadyCached,
			})
			return this
		}
		logger.debug(
			'Setting',
			key,
			'to',
			value,
			'in',
			path.basename(this.storeFilePath)
		)
		dotProp.set(this.data, key, value)
		writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
		return this
	}

	/**
	 * Get item from the store whose key matches the provided one
	 */
	get(key: string): T | undefined | any {
		return dotProp.get(this.data, key)
	}

	/**
	 * Deletes an item from the store
	 */
	delete(key: string): this {
		logger.debug('Deleting', key, 'from', path.basename(this.storeFilePath))
		dotProp.delete(this.data, key)
		writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
		return this
	}

	/** Return an array of the values in the store for iteration */
	listify(): T[] {
		return Object.values(this.data)
	}

	/**
	 * Iterates over the entire store and finds all items where condition is matched
	 *
	 * gets passed a function that is run for each item of of the store used to match items
	 */
	getAllWhere(filterFunction: (key: string, value: any) => boolean): any[] {
		return Object.entries(this.data)
			.filter(([key, value]) => filterFunction(key, value))
			.map(([, value]) => {
				return value
			})
	}

	/**
	 * Resore the store from the backup.json file if there is one
	 */
	restoreFromBackup(): void {
		logger.debug('Restoring from backup')
		const backupFilePath = path.resolve(this.storePath, 'backup.json')
		if (backupFilePath) {
			// write backup file to the store file
			try {
				logger.debug('writing backup to store file')
				const backupFile = readFileSync(backupFilePath, 'utf8')
				this.data = JSON.parse(backupFile)
				writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
			} catch (error) {
				logger.debug(error)
				return
			}

			// delete backup file
			try {
				logger.debug('deleting backup file')
				removeFileSync(backupFilePath)
			} catch (error) {
				logger.debug(error)
				return
			}
		}
	}

	/**
	 * Backup the store to backup.json in the same directory as the store
	 */
	backup(): void {
		writeFileSync(
			path.resolve(this.storePath, 'backup.json'),
			JSON.stringify(this.data),
			'utf8'
		)
	}
	/**
	 * clear the entire store of data for testing purposes
	 *
	 * Be careful with this method, it will delete all data in the store
	 *
	 * if you clear the store by mistake, you can recover the files from the backup.json file
	 * housed in the same directory as the store file
	 */
	clear(): void {
		this.backup()
		this.data = {}
		writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
	}
}

/*********************EXPORTS**********************/

export { BaseStore }

export { StoreFileData, BaseStoreOptions }
