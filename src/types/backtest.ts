export interface BackTestOptions {
	barCount: number
	pyramiding: number
}

export type GenericObject = { [key: string]: any }

export type TradeType = "Long" | "Short"
export type WinLossType = "None" | "LongWin" | "LongLoss" | "ShortWin" | "ShortLoss"

export type SideType = {
	// [key in string]: {
	// 	options: SideOptions
	// 	orders: Orders[]
	// }
	[key in string]: Orders[]
}

export interface SideOptions {
	quantity: number
	fee: number
}

export interface Orders {
	quantity: number
	fee: number
	
	barId: number
	enterPrice: number
	stopLoss?: number
	takeProfit?: number
}

export interface HistoryType {

	barId: number
	exitBarId: number
	
	side: TradeType
	id: string
	cause: string // exit alias

	quantity: number

	feeEnter: number
	feeExit: number

	drawDown: number
	runUp: number

	pnlPercent: number
	pnl: number
}


export interface Trades {
	Long: SideType
	LongLength: number
	LongWin: number
	LongLoss: number

	Short: SideType
	ShortLength: number
	ShortWin: number
	ShortLoss: number
	
	WinLossList: WinLossType[]

	LastOrderStatus: WinLossType

	MaxDrawDown: number
	MaxRunUp: number
	
	History: HistoryType[]

	FeePaidPercent: number

	PNL: number
	PNLPercent: number
}

// ########## Run
export interface CrossFunction {
	(a: Array<number>, b: number | Array<number>): number
}

export interface Enter {
	side: TradeType
	id: string
	fee: number
	quantity: number
	stopLoss?: number
	takeProfit?: number
}

export interface Exit {
	side: TradeType
	target_id: string
	feeExit: number
	cause?: string // the name for exit, Example: Stop Loss, Close, Exit, ...
	when?: boolean | number
	
	changeStopLoss?: number
	changeTakeProfit?: number
}

export interface EnterFunction {
	(options: Enter): void
}

export interface ExitFunction {
	(options: Exit): void
}

export interface Strategy {
	barId: number
	indicators: GenericObject
	trades: Trades

	crossover: CrossFunction
	crossunder: CrossFunction

	enter: EnterFunction
	exit: ExitFunction
}