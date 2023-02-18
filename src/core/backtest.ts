import {
	Trades, GenericObject,
	Enter, Exit
} from "../types/backtest"

export interface BackTestOptions {
	barCount: number
	pyramiding: number
}

export class BackTest {

	barCount: number
	pyramiding: number

	constructor(options: BackTestOptions) {
		this.barCount = options.barCount
		this.pyramiding = options.pyramiding
	}

	indicators: GenericObject = {}

	barId: number = 0

	trades: Trades = {
		Long: {},
		LongLength: 0,
		LongLoss: 0,
		LongWin: 0,

		Short: {},
		ShortLength: 0,
		ShortLoss: 0,
		ShortWin: 0,

		WinLossList: [],
		LastOrderStatus: "None",

		MaxDrawDown: 0,
		MaxRunUp: 0,

		History: [],

		FeePaidPercent: 0,
		PNL: 0,
		PNLPercent: 0,
	}

	sumActiveOrders: number = 0

	// ### Tools
	_crossOver(
		a: number, b: number,
		preA: number, preB: number
	) {
		let result = false

		if (a > b && preA <= preB) {
			result = true
		}

		return result
	}

	_crossUnder(
		a: number, b: number,
		preA: number, preB: number
	) {
		let result = false

		if (a < b && preA >= preB) {
			result = true
		}

		return result
	}

	_crossOverNumber(current: number, pre: number, number: number) {
		return this._crossOver(current, number, pre, number)
	}

	_crossUnderNumber(current: number, pre: number, number: number) {
		return this._crossUnder(current, number, pre, number)
	}

	// ######################### Time Frame
	chunk(array: any[], chunkSize: number) {
        
		let results = []

        for (let i = 0; i < array.length; i += chunkSize) {
			results.push(array.slice(i, i + chunkSize))
		}

        return results
    }

	/**
	 * 
	 * @param array 
	 * @param length 
	 * @returns 
	 */
	firstElements(array: any[][], length: number) {
    
		let result = []
		
		for (let i = 0; i < array.length; i++) {
			if (array[i].length === length) {
				result.push(array[i][0])
			}
		}
	
		return result
	}

	firstElementsWithNaN(array: number[][], length: number) {
		
		let results = []

		for (let i = 0; i < array.length; i++) {
			if (array[i].length !== length) {
				continue
			}
			for (let j = 0; j < length - 1; j++) {
				results.push(NaN)
			}
			results.push(array[i][0])
		}

		return results
	}

	lastElements(array: any[][], length: number) {

		const result = []
	
		for (let i = 0; i < array.length; i++) {
			if (array[i].length === length) {
				result.push(array[i][length - 1])
			}
		}
	
		return result
	}

	lastElementsWithNaN(array: any[][], length: number) {
		let results = [];
		for (let subArray of array) {
			if (subArray.length === length) {
				for (let i = 0; i < length - 1; i++) {
					results.push(NaN);
				}
				results.push(subArray[subArray.length - 1]);
			}
		}
		return results;
	}

	/**
	 * 
	 * @param array 
	 * @param length 
	 * @returns 
	 */
	maxElements(array: any[][], length: number) {
		let maxArr = []
		let max = 0
	
		for (let i = 0; i < array.length; i++) {
			if (array[i].length === length) {
				max = 0
				for (let j = 0; j < array[i].length; j++) {
					if (array[i][j] > max) {
						max = array[i][j]
					}
				}
				maxArr.push(max)
			}
		}
		return maxArr
	}

	maxElementsWithNaN(array: number[][], length: number) {
		let maxElements = []
		let firstArrayLength = array[0].length;
		for (let subArray of array) {
			if (subArray.length === firstArrayLength) {
				for (let i = 0; i < length - 1; i++) {
					maxElements.push(NaN)
				}
				maxElements.push(Math.max(...subArray))
			}
		}
		return maxElements
	}

	/**
	 * 
	 * @param array 
	 * @param length 
	 * @returns 
	 */
	minElements(array: any[][], length: number) {
		let minArr = []
		
		for (let i = 0; i < array.length; i++) {
			if (array[i].length === length) {
				minArr.push(Math.min(...array[i]))
			}
		}
	
		return minArr
	}

	minElementsWithNaN(array: number[][], length: number) {
		let minElements = []
		let firstArrayLength = array[0].length;
		for (let subArray of array) {
			if (subArray.length === firstArrayLength) {
				for (let i = 0; i < length - 1; i++) {
					minElements.push(NaN)
				}
				minElements.push(Math.min(...subArray))
			}
		}
		return minElements
	}

	sumElements(array: number[][], length: number) {
    
		let sumArr: number[] = []
	
		array.forEach((subArr) => {
			if (subArr.length === length) {
				let subSum = subArr.reduce((a, b) => a + b, 0)
				sumArr.push(subSum)
			}
		})
	
		return sumArr
	}

	sumElementsWithNaN(array: number[][], length: number) {
		let sumElements = []
		let firstArrayLength = array[0].length;
		for (let subArray of array) {
			if (subArray.length === firstArrayLength) {
				for (let i = 0; i < length - 1; i++) {
					sumElements.push(NaN)
				}
				sumElements.push(subArray.reduce((a, b) => a + b))
			}
		}
		return sumElements
	}

	openTimeFrame(open: number[], timeFrame: number) {
		let chunkedData = this.chunk(open, timeFrame)

		return this.firstElements(chunkedData, timeFrame)
	}

	indicatorTimeFrame() {}
	// #########################


	/**
	 * from: @ixjb94/indicators
	 * 
	 * @param originalLength 
	 * @param source 
	 * @param empty 
	 * @returns 
	 */
	normalize(originalLength: number, source: Array<number> | string, empty: any = NaN): Array<number> {
		let diff = originalLength - source.length

		let emptyList: Array<any> = []
		for (let index = 0; index < diff; ++index) {
			emptyList.push(empty)
		}

		let result = [...emptyList, ...source]

		return result
	}


	normalizeIndicators(indicatorsObject: GenericObject) {

		for (const key in indicatorsObject) {
			let indicatorValue = indicatorsObject[key]

			this.indicators[key] = this.normalize(this.barCount, indicatorValue)
		}

		return this.indicators
	}

	crossOver(sourceA: Array<number>, sourceB: number | Array<number>) {
		
		let currentA = sourceA[this.barId]
		let preA = sourceA[this.barId - 1]

		if (sourceB instanceof Array<number>) {
			let currentB = sourceB[this.barId]
			let preB = sourceB[this.barId - 1]
			return this._crossOver(currentA, currentB, preA, preB)

		}

		return this._crossOverNumber(currentA, preA, sourceB)
	}

	crossUnder(sourceA: Array<number>, sourceB: number | Array<number>) {

		let currentA = sourceA[this.barId]
		let preA = sourceA[this.barId - 1]

		if (sourceB instanceof Array<number>) {
			let currentB = sourceB[this.barId]
			let preB = sourceB[this.barId - 1]
			return this._crossUnder(currentA, currentB, preA, preB)

		}

		return this._crossUnderNumber(currentA, preA, sourceB)
	}
	// ### Tools

	run(Strategy: Function) {

		const dataObject = {
			barId: this.barId,
			indicators: this.indicators,
			trades: this.trades,

			crossover: this.crossOver.bind(this),
			crossunder: this.crossUnder.bind(this),
			enter: this.enter.bind(this),
			exit: this.exit.bind(this)
		}

		for (this.barId = 0; this.barId < this.barCount; ++this.barId) {
			
			dataObject.barId = this.barId
			dataObject.trades = this.trades

			Strategy(dataObject)
		}
	}

	enter(options: Enter) {

		let sumActiveOrders = this.trades.LongLength + this.trades.ShortLength

		// Check Pyramiding
		if (this.pyramiding <= sumActiveOrders) {
			// console.log("Pyramiding:", "Can't process more")
			return false
		}

		/** Schema
		Long: { <= side
			Buy1: [ <= id
				{
					qty: 10,
					etc.
				}
			],
			Buy2: [],
		}

		*/
		// Create id if its not exists
		if (!this.trades[options.side][options.id]) {
			this.trades[options.side][options.id] = []
		}

		this.trades[options.side][options.id].push({
			fee: options.fee,
			quantity: options.quantity,
			barId: this.barId,
			enterPrice: this.indicators.close[this.barId],
			stopLoss: options.stopLoss,
			takeProfit: options.takeProfit
		})

		// Increase Length
		if (options.side == "Long") {
			this.trades.LongLength++
		} else {
			this.trades.ShortLength++
		}

		// Increase Fee Paid
		this.trades.FeePaidPercent += options.fee
	}

	exit(options: Exit) {

		if (!this.trades[options.side][options.target_id]) {
			return false
		}

		let orders = this.trades[options.side][options.target_id]

		let open = this.indicators.open[this.barId]
		let high = this.indicators.high[this.barId]
		let low = this.indicators.low[this.barId]
		let close = this.indicators.close[this.barId]

		OrdersLabel: for (let index = 0; index < orders.length; ++index) {

			let order = orders[index]
			
			if (!order) {
				break
			}

			let enterId = order.barId

			// Can't perform on the same bar
			if (this.barId == enterId) {
				continue OrdersLabel
			}
			
			let enterPrice = order.enterPrice
			let stopLoss = order.stopLoss
			let takeProfit = order.takeProfit

			let feeEnter = order.fee
			let feeExit = options.feeExit
			let quantity = order.quantity

			if (options.changeStopLoss || options.changeStopLoss == 0) {
				stopLoss = options.changeStopLoss
			}

			if (options.changeTakeProfit) {
				takeProfit = options.changeTakeProfit
			}

			let historyData = {
				barId: order.barId,
				exitBarId: this.barId,
				feeEnter,
				feeExit,
				id: options.target_id,
				quantity: order.quantity,
				side: options.side,
			}

			if (options.side == "Long") {

				if (stopLoss) {
					if (stopLoss >= low) {
		
						let percent = 100 - ((stopLoss * 100) / enterPrice)
						
						let totalFee = feeEnter + feeExit

						percent += totalFee
						
						let pnl = (quantity * (1 - (percent / 100))) - quantity

						this.trades.PNL += pnl
						
						// #### DrawDown | Run-Up
						// Init
						let drawDown = this.indicators.high[order.barId]
						let runUp    = this.indicators.low[order.barId]

						for (let index = order.barId; index < this.barId; index++) {
							const newHigh = this.indicators.high[index]
							const newLow  = this.indicators.low[index]

							if (newHigh >= runUp) {
								runUp = newHigh
							}

							if (newLow <= drawDown) {
								drawDown = newLow
							}
						}

						// DrawDown | RunUp to Percent
						let drawDownPercent = 100 - ((drawDown * 100) / order.enterPrice)
						let runUpPercent    = 100 - ((order.enterPrice * 100) / runUp)

						// Max DrawDown | Run-Up
						let maxDrawDown = this.trades.MaxDrawDown
						let maxRunUp    = this.trades.MaxRunUp

						if (drawDownPercent >= maxDrawDown) {
							this.trades.MaxDrawDown = drawDownPercent
						}

						if (runUpPercent >= maxRunUp) {
							this.trades.MaxRunUp = runUpPercent
						}

						this.trades.History.push({
							...historyData,
							pnl,
							pnlPercent: percent,
							drawDown: drawDownPercent,
							runUp: runUpPercent,
							cause: "Stop Loss",
						})
						this.trades.LongLength--
						this.trades.LongLoss++

						// Statics
						this.trades.FeePaidPercent += options.feeExit
						this.trades.WinLossList.push("LongLoss")
						this.trades.LastOrderStatus = "LongLoss"

						orders.splice(index, 1)
						continue OrdersLabel
					}
				}

				if (takeProfit) {
					if (takeProfit <= high) {

						let percent = 100 - ((enterPrice * 100) / takeProfit)
						
						let totalFee = feeEnter + feeExit

						percent -= totalFee
						
						let pnl = (quantity * (1 + (percent / 100))) - quantity
						
						this.trades.PNL += pnl

						// #### DrawDown | Run-Up
						// Init
						let drawDown = this.indicators.high[order.barId]
						let runUp    = this.indicators.low[order.barId]

						for (let index = order.barId; index < this.barId; index++) {
							const newHigh = this.indicators.high[index]
							const newLow  = this.indicators.low[index]

							if (newHigh >= runUp) {
								runUp = newHigh
							}

							if (newLow <= drawDown) {
								drawDown = newLow
							}
						}

						// DrawDown | RunUp to Percent
						let drawDownPercent = 100 - ((drawDown * 100) / order.enterPrice)
						let runUpPercent    = 100 - ((order.enterPrice * 100) / runUp)

						// Max DrawDown | Run-Up
						let maxDrawDown = this.trades.MaxDrawDown
						let maxRunUp    = this.trades.MaxRunUp

						if (drawDownPercent >= maxDrawDown) {
							this.trades.MaxDrawDown = drawDownPercent
						}

						if (runUpPercent >= maxRunUp) {
							this.trades.MaxRunUp = runUpPercent
						}

						this.trades.History.push({
							...historyData,
							pnl,
							pnlPercent: percent,
							drawDown: drawDownPercent,
							runUp: runUpPercent,
							cause: "Take Profit"
						})
						
						this.trades.LongLength--
						this.trades.LongWin++
						
						// Statics
						this.trades.FeePaidPercent += options.feeExit
						this.trades.WinLossList.push("LongWin")
						this.trades.LastOrderStatus = "LongWin"

						orders.splice(index, 1)
						continue OrdersLabel
					}
				}
				
				// Exit
				// some indicators like MACD have 0, so options.when === 0
				if (options.when || options.when === 0) {

					let percent = 100 - ((enterPrice * 100) / close)
					
					let totalFee = -1 * (feeEnter + feeExit)

					percent += totalFee
					
					let pnl = (quantity * (1 + (percent / 100))) - quantity
					
					this.trades.PNL += pnl

					// #### DrawDown | Run-Up
					// Init
					let drawDown = this.indicators.high[order.barId]
					let runUp    = this.indicators.low[order.barId]

					for (let index = order.barId; index < this.barId; index++) {
						const newHigh = this.indicators.high[index]
						const newLow  = this.indicators.low[index]

						if (newHigh >= runUp) {
							runUp = newHigh
						}

						if (newLow <= drawDown) {
							drawDown = newLow
						}
					}

					// DrawDown | RunUp to Percent
					let drawDownPercent = 100 - ((drawDown * 100) / order.enterPrice)
					let runUpPercent    = 100 - ((order.enterPrice * 100) / runUp)

					// Max DrawDown | Run-Up
					let maxDrawDown = this.trades.MaxDrawDown
					let maxRunUp    = this.trades.MaxRunUp

					if (drawDownPercent >= maxDrawDown) {
						this.trades.MaxDrawDown = drawDownPercent
					}

					if (runUpPercent >= maxRunUp) {
						this.trades.MaxRunUp = runUpPercent
					}

					this.trades.History.push({
						...historyData,
						pnl,
						pnlPercent: percent,
						drawDown: drawDownPercent,
						runUp: runUpPercent,
						cause: options.cause ?? "Exit",
					})
					
					this.trades.LongLength--

					if (pnl > 0) {
						this.trades.LongWin++
						this.trades.WinLossList.push("LongWin")
						this.trades.LastOrderStatus = "LongWin"
					} else {
						this.trades.LongLoss++
						this.trades.WinLossList.push("LongLoss")
						this.trades.LastOrderStatus = "LongLoss"
					}

					// Statics
					this.trades.FeePaidPercent += options.feeExit

					delete orders[index]
					continue OrdersLabel
				}

			} else if (options.side == "Short") {

				if (stopLoss) {
					if (stopLoss <= high) {
		
						let percent = 100 - ((enterPrice * 100) / stopLoss)
						
						let totalFee = feeEnter + feeExit

						percent += totalFee
						
						let pnl = (quantity * (1 - (percent / 100))) - quantity
						
						this.trades.PNL += pnl
						
						// #### DrawDown | Run-Up
						// Init
						let drawDown = this.indicators.low[order.barId]
						let runUp    = this.indicators.high[order.barId]

						for (let index = order.barId; index < this.barId; index++) {
							const newHigh = this.indicators.high[index]
							const newLow  = this.indicators.low[index]

							if (newLow <= runUp) {
								runUp = newLow
							}

							if (newHigh >= drawDown) {
								drawDown = newHigh
							}
						}

						// DrawDown | RunUp to Percent
						let drawDownPercent = 100 - ((order.enterPrice * 100) / drawDown)
						let runUpPercent    = 100 - ((runUp * 100) / order.enterPrice)

						// Max DrawDown | Run-Up
						let maxDrawDown = this.trades.MaxDrawDown
						let maxRunUp    = this.trades.MaxRunUp

						if (drawDownPercent >= maxDrawDown) {
							this.trades.MaxDrawDown = drawDownPercent
						}

						if (runUpPercent >= maxRunUp) {
							this.trades.MaxRunUp = runUpPercent
						}
						
						this.trades.History.push({
							...historyData,
							pnl,
							pnlPercent: percent,
							drawDown: drawDownPercent,
							runUp: runUpPercent,
							cause: "Stop Loss",
						})
						this.trades.ShortLength--
						this.trades.ShortLoss++

						// Statics
						this.trades.FeePaidPercent += options.feeExit
						this.trades.WinLossList.push("ShortLoss")
						this.trades.LastOrderStatus = "ShortLoss"

						orders.splice(index, 1)
						continue OrdersLabel
					}
				}

				if (takeProfit) {
					if (takeProfit >= low) {

						let percent = 100 - ((takeProfit * 100) / enterPrice)
						
						let totalFee = feeEnter + feeExit
						
						percent -= totalFee
						
						let pnl = (quantity * (1 + (percent / 100))) - quantity
						
						this.trades.PNL += pnl

						// #### DrawDown | Run-Up
						// Init
						let drawDown = this.indicators.low[order.barId]
						let runUp    = this.indicators.high[order.barId]

						for (let index = order.barId; index < this.barId; index++) {
							const newHigh = this.indicators.high[index]
							const newLow  = this.indicators.low[index]

							if (newLow <= runUp) {
								runUp = newLow
							}

							if (newHigh >= drawDown) {
								drawDown = newHigh
							}
						}

						// DrawDown | RunUp to Percent
						let drawDownPercent = 100 - ((order.enterPrice * 100) / drawDown)
						let runUpPercent    = 100 - ((runUp * 100) / order.enterPrice)

						// Max DrawDown | Run-Up
						let maxDrawDown = this.trades.MaxDrawDown
						let maxRunUp    = this.trades.MaxRunUp

						if (drawDownPercent >= maxDrawDown) {
							this.trades.MaxDrawDown = drawDownPercent
						}

						if (runUpPercent >= maxRunUp) {
							this.trades.MaxRunUp = runUpPercent
						}

						this.trades.History.push({
							...historyData,
							pnl,
							pnlPercent: percent,
							drawDown: drawDownPercent,
							runUp: runUpPercent,
							cause: "Take Profit"
						})
						
						this.trades.ShortLength--
						this.trades.ShortWin++
						
						// Statics
						this.trades.FeePaidPercent += options.feeExit
						this.trades.WinLossList.push("ShortWin")
						this.trades.LastOrderStatus = "ShortWin"

						orders.splice(index, 1) // delete
						continue OrdersLabel
					}
				}
				
				// Exit
				// some indicators like MACD have 0, so options.when === 0
				if (options.when || options.when === 0) {

					let percent = 100 - ((close * 100) / enterPrice)
						
					let totalFee = -1 * (feeEnter + feeExit)
					
					percent += totalFee
					
					let pnl = (quantity * (1 + (percent / 100))) - quantity
					
					this.trades.PNL += pnl

					// #### DrawDown | Run-Up
					// Init
					let drawDown = this.indicators.low[order.barId]
					let runUp    = this.indicators.high[order.barId]

					for (let index = order.barId; index < this.barId; index++) {
						const newHigh = this.indicators.high[index]
						const newLow  = this.indicators.low[index]

						if (newLow <= runUp) {
							runUp = newLow
						}

						if (newHigh >= drawDown) {
							drawDown = newHigh
						}
					}

					// DrawDown | RunUp to Percent
					let drawDownPercent = 100 - ((order.enterPrice * 100) / drawDown)
					let runUpPercent    = 100 - ((runUp * 100) / order.enterPrice)

					// Max DrawDown | Run-Up
					let maxDrawDown = this.trades.MaxDrawDown
					let maxRunUp    = this.trades.MaxRunUp

					if (drawDownPercent >= maxDrawDown) {
						this.trades.MaxDrawDown = drawDownPercent
					}

					if (runUpPercent >= maxRunUp) {
						this.trades.MaxRunUp = runUpPercent
					}

					this.trades.History.push({
						...historyData,
						pnl,
						pnlPercent: percent,
						drawDown: drawDownPercent,
						runUp: runUpPercent,
						cause: options.cause ?? "Exit",
					})
					
					this.trades.ShortLength--

					if (pnl > 0) {
						this.trades.ShortWin++
						this.trades.WinLossList.push("ShortWin")
						this.trades.LastOrderStatus = "ShortWin"
					} else {
						this.trades.ShortLoss++
						this.trades.WinLossList.push("ShortLoss")
						this.trades.LastOrderStatus = "ShortLoss"
					}

					// Statics
					this.trades.FeePaidPercent += options.feeExit

					delete orders[index]
					continue OrdersLabel
				}
			}
		}

		// Clean-up empty array
		// orders = orders.filter(d => d)
		this.trades[options.side][options.target_id] = this.trades[options.side][options.target_id].filter(d => d)
	}

	/**
	 * 
	 * @param grossProfit - The $ Win
	 * @param grossLoss - The $ Loss
	 * @returns 
	 */
	profitFactor(grossProfit: number, grossLoss: number) {
		
		let profitFactor = grossProfit / grossLoss

		return profitFactor
	}
	
}