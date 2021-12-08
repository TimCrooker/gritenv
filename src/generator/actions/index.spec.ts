import { Grit } from '@/generator'
import path from 'path'
import { getGenerator } from '../getGenerator'

let grit: Grit

describe('Run Actions', () => {
	beforeEach(async () => {
		grit = await getGenerator({
			generator: path.join(__dirname, 'fixtures'),
			mock: true,
		})
	})

	it('Should add all files from templateDir to outDir with transformations', async () => {
		const name = 'Tim'

		await grit.run()

		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeTruthy()

		await expect(grit.readOutputFile('foo.txt')).resolves.toEqual(name)
	})

	it('Should rename file with move action', async () => {
		await grit.run()

		await expect(grit.hasOutputFile('buz.json')).resolves.toBeTruthy()

		const output = (await grit.readOutputFile('buz.json')) as Record<
			string,
			any
		>
		expect(output.bar).toEqual('Tim')
	})

	it('Should copy file', async () => {
		await grit.run()

		await expect(grit.hasOutputFile('buz.json')).resolves.toBeTruthy()
		await expect(grit.hasOutputFile('bill.json')).resolves.toBeTruthy()
		await expect(grit.hasOutputFile('foo.txt')).resolves.toBeTruthy()

		const output = (await grit.readOutputFile('buz.json')) as Record<
			string,
			any
		>
		expect(output.bar).toEqual('Tim')
	})

	it('Should add data to file with modify action', async () => {
		await grit.run()

		await expect(grit.hasOutputFile('buz.json')).resolves.toBeTruthy()
		await expect(grit.hasOutputFile('bill.json')).resolves.toBeTruthy()

		const buz = (await grit.readOutputFile('buz.json')) as Record<string, any>
		expect(buz.extra).toEqual('extra')
		expect(buz.bar).toEqual('Tim')

		const bill = (await grit.readOutputFile('bill.json')) as Record<string, any>
		expect(bill.extra).toEqual('extra')
		expect(bill.bar).toEqual('Tim')
	})

	it('Should remove file', async () => {
		await grit.run()

		await expect(grit.hasOutputFile('copy.txt')).resolves.toBeFalsy()
	})
})
