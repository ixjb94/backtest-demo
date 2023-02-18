export class CsvParser {
	
	constructor() { }
	
	/**
	 * 
	 * @link check for inspire: https://csv.js.org/project/examples/
	 * @TODO format, skipLine
	 * format is headers name
	 * OR read headers and automatically create the format
	 * 
	 * @param array 
	 * @param format example: 
	 * {
	 * 		openTime: string, (or number, ...)
	 * 		open: number,
	 * 		high: number,
	 * 		low: number,
	 * 		close: number,
	 * 		volume: number,
	 * 		closeTime: string,
	 * }
	 * @param length 
	 * @param skipLine
	 * @returns 
	 */
	ohlcv(array: Array<any>, format: any = {}, length: number = array.length, skipLine = 1) {

		let openTime = []
		let open = []
		let high = []
		let low = []
		let close = []
		let volume = []
		let closeTime = []

		for (let index = 1; index < array.length; index++) {
			const list: Array<any> = array[index]
			
			for (let listIndex = 0; listIndex < list.length; listIndex++) {
				
				let element = list[listIndex]
				element = Number(element)
				
				// openTime
				if (listIndex == 0) {
					openTime.push(element)
				}

				// open
				else if (listIndex == 1) {
					open.push(element)
				}
				
				// high
				else if (listIndex == 2) {
					high.push(element)
				}

				// low
				else if (listIndex == 3) {
					low.push(element)
				}

				// close
				else if (listIndex == 4) {
					close.push(element)
				}

				// volume
				else if (listIndex == 5) {
					volume.push(element)
				}

				// closeTime
				else if (listIndex == 6) {
					closeTime.push(element)
				}
			}
		}

		return [openTime, open, high, low, close, volume, closeTime]
	}

	CSVToArray(strData: string, strDelimiter: string = ","): Array<string | number> {

		strDelimiter = (strDelimiter || ",")

		let objPattern = new RegExp(
			(
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
		)

		let arrData: any = [[]]
		let arrMatches: any = null

		while (arrMatches = objPattern.exec(strData)) {

			let strMatchedDelimiter = arrMatches[1]

			if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
			) {
				arrData.push([]);
			}


			let strMatchedValue: any

			if (arrMatches[2]) {
				strMatchedValue = arrMatches[2].replace(
					new RegExp("\"\"", "g"),
					"\""
				)

			} else {
				strMatchedValue = arrMatches[3]
			}

			arrData[arrData.length - 1].push(strMatchedValue)
		}

		return (arrData)
	}
}