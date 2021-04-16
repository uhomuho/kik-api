require('dotenv').config()

const express = require('express'),
			{ json, urlencoded } = require('body-parser'),
			helmet = require('helmet'),
			cors = require('cors'),
			{ CronJob } = require('cron'),
			{ get, post } = require('axios'),
			botLink = `https://api.telegram.org/bot${process.env.BOT}/sendMessage`
			moment = require('dayjs')

const getCount = (item) => item.length > 0 ? parseInt(item[0].count) : 0

const getOrder = (items, isCarrot) => isCarrot ? Math.ceil((items.reduce((a, b) => a + b) / items.length) + 2) : Math.ceil((items.reduce((a, b) => a + b) / items.length))

const getStats = async (id, date) => {
	let stats = await get(`https://joinposter.com/api/dash.getProductsSales?token=915706:4164813c0a5214ec7dd9511d6717668e&spot_id=${id}&date_from=${date.add(1, 'd').format('YYYYMMD')}&date_to=${date.add(1, 'd').format('YYYYMMD')}`)
		.then(res => res.data.response)

	let sandwiches_chicken = stats.filter(item => item.product_name == "Сэндвич КУРИЦА ЦЕЗАРЬ"), 
			sandwiches_chicken_ter = stats.filter(item => item.product_name == "Сэндвич КУРИЦА ТЕРИЯКИ"),
			sandwiches_fish = stats.filter(item => item.product_name == "Сэндвич РЫБА"),
			sandwiches_peperoni = stats.filter(item => item.product_name == "Сэндвич ПЕПЕРОНИ"),
			sandwiches_egg = stats.filter(item => item.product_name == "Сэндвич ЯЙЦО И ВЕТЧИНА"),
			sandwiches_tuna = stats.filter(item => item.product_name == "Сэндвич С ТУНЦОМ"),
			carrotPie = stats.filter(item => item.product_name == "Морковный пирог"),
			cherryPie = stats.filter(item => item.product_name == "Пирог пай(ягодный)")

			sandwiches_chicken = getCount(sandwiches_chicken)
			sandwiches_chicken_ter = getCount(sandwiches_chicken_ter)
			sandwiches_fish = getCount(sandwiches_fish)
			sandwiches_peperoni = getCount(sandwiches_peperoni)
			sandwiches_egg = getCount(sandwiches_egg)
			sandwiches_tuna = getCount(sandwiches_tuna)
			carrotPie = getCount(carrotPie)
			cherryPie = getCount(cherryPie)

	stats = await get(`https://joinposter.com/api/dash.getProductsSales?token=915706:4164813c0a5214ec7dd9511d6717668e&spot_id=${id}&date_from=${date.add(2, 'd').format('YYYYMMD')}&date_to=${date.add(2, 'd').format('YYYYMMD')}`)
		.then(res => res.data.response)

	sandwiches_chicken += getCount(stats.filter(item => item.product_name == "Сэндвич КУРИЦА ЦЕЗАРЬ")) 
	sandwiches_chicken_ter += getCount(stats.filter(item => item.product_name == "Сэндвич КУРИЦА ТЕРИЯКИ"))
	sandwiches_fish += getCount(stats.filter(item => item.product_name == "Сэндвич РЫБА"))
	sandwiches_peperoni += getCount(stats.filter(item => item.product_name == "Сэндвич ПЕПЕРОНИ"))
	sandwiches_egg += getCount(stats.filter(item => item.product_name == "Сэндвич ЯЙЦО И ВЕТЧИНА"))
	sandwiches_tuna += getCount(stats.filter(item => item.product_name == "Сэндвич С ТУНЦОМ"))
	carrotPie += getCount(stats.filter(item => item.product_name == "Морковный пирог"))
	cherryPie += getCount(stats.filter(item => item.product_name == "Пирог пай(ягодный)"))

	if (moment().day() == 4) {
		stats = await get(`https://joinposter.com/api/dash.getProductsSales?token=915706:4164813c0a5214ec7dd9511d6717668e&spot_id=${id}&date_from=${date.add(3, 'd').format('YYYYMMD')}&date_to=${date.add(3, 'd').format('YYYYMMD')}`)
		.then(res => res.data.response)

		sandwiches_chicken += getCount(stats.filter(item => item.product_name == "Сэндвич КУРИЦА ЦЕЗАРЬ")) 
		sandwiches_chicken_ter += getCount(stats.filter(item => item.product_name == "Сэндвич КУРИЦА ТЕРИЯКИ"))
		sandwiches_fish += getCount(stats.filter(item => item.product_name == "Сэндвич РЫБА"))
		sandwiches_peperoni += getCount(stats.filter(item => item.product_name == "Сэндвич ПЕПЕРОНИ"))
		sandwiches_egg += getCount(stats.filter(item => item.product_name == "Сэндвич ЯЙЦО И ВЕТЧИНА"))
		sandwiches_tuna += getCount(stats.filter(item => item.product_name == "Сэндвич С ТУНЦОМ"))
		carrotPie = carrotPie + getCount(stats.filter(item => item.product_name == "Морковный пирог"))
		cherryPie = cherryPie + getCount(stats.filter(item => item.product_name == "Пирог пай(ягодный)"))
	}
	
	return { sandwiches_chicken, sandwiches_chicken_ter, sandwiches_fish, sandwiches_peperoni, sandwiches_egg, sandwiches_tuna, carrotPie, cherryPie }
}

const getTotal = async id => {
	let dateWeekAgo = moment().subtract(7,'d'),
			dateTwoWeeksAgo = moment().subtract(14,'d'),
			dateThreeWeeksAgo = moment().subtract(21,'d')

	let f = await getStats(id, dateWeekAgo)
	let s = await getStats(id, dateTwoWeeksAgo)
	let t = await getStats(id, dateThreeWeeksAgo)

	return {
		sandwiches_chicken: getOrder([f.sandwiches_chicken, s.sandwiches_chicken, t.sandwiches_chicken]),
		sandwiches_chicken_ter: getOrder([f.sandwiches_chicken_ter, s.sandwiches_chicken_ter, t.sandwiches_chicken_ter]),
		sandwiches_fish: getOrder([f.sandwiches_fish, s.sandwiches_fish, t.sandwiches_fish]),
		sandwiches_peperoni: getOrder([f.sandwiches_peperoni, s.sandwiches_peperoni, t.sandwiches_peperoni]),
		sandwiches_egg: getOrder([f.sandwiches_egg, s.sandwiches_egg, t.sandwiches_egg]),
		sandwiches_tuna: getOrder([f.sandwiches_tuna, s.sandwiches_tuna, t.sandwiches_tuna]),
		carrotPie: getOrder([f.carrotPie, s.carrotPie, t.carrotPie], true),
		cherryPie: getOrder([f.cherryPie, s.cherryPie, t.cherryPie])
	}
}

const notify = ({ sandwiches_chicken, sandwiches_chicken_ter, sandwiches_fish, sandwiches_peperoni, sandwiches_egg, sandwiches_tuna, carrotPie, cherryPie }, name, chat_id) => {
	post(botLink, {
		// chat_id: 252920458,
		chat_id: chat_id ? chat_id : 780392838,
		text: `На <b>${name}</b>:\n\n- <b>${sandwiches_chicken}</b> Сендвичей <b>с курицей</b>\n- <b>${sandwiches_chicken_ter}</b> Сендвичей <b>с курицей терияки</b>\n- <b>${sandwiches_fish}</b> Сендвичей <b>с рыбой</b>\n- <b>${sandwiches_peperoni}</b> Сендвичей <b>с пеперони</b>\n- <b>${sandwiches_egg}</b> Сендвичей <b>с яйцом и ветчиной</b>\n- <b>${sandwiches_tuna}</b> Сендвичей <b>с тунцом</b>\n- <b>${carrotPie}</b> Морковных тортиков\n- <b>${cherryPie}</b> Вишнёвых пирогов`,
		parse_mode: 'HTML' 
	})
		.catch(err => console.error(err))
}

let job = new CronJob('00 00 12 * * 0,2,4', function() {
	// Аллея
	getTotal(5)
		.then(res => {
			console.log('Аллея: ', res)
			notify(res, 'Аллею')
		})
	
	// Ньютон
	getTotal(3)
		.then(res => {
			console.log('Ньютон: ', res)
			notify(res, 'Ньютон')
		})

	// МФЦ
	getTotal(2)
		.then(res => {
			console.log('МФЦ: ', res)
			notify(res, 'МФЦ')
		})
}, null, true, 'Asia/Yekaterinburg')

job.start()

// Create server
const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))

app.use(cors())
app.use(helmet())

app.use((req, res, next) => {
	console.log(`${req.method} request for ${req.url}`)
	next()
})

app.get('/', (req, res) => {
	res.send('KIK Api v0.0.1')
})

app.post('/get_order', (req, res) => {

	let { chat_id } = req.body
	// Аллея
	getTotal(5)
		.then(res => {
			console.log('Аллея: ', res)
			notify(res, 'Аллею', chat_id)
		})
	
	// Ньютон
	getTotal(3)
		.then(res => {
			console.log('Ньютон: ', res)
			notify(res, 'Ньютон', chat_id)
		})

	// МФЦ
	getTotal(2)
		.then(res => {
			console.log('МФЦ: ', res)
			notify(res, 'МФЦ', chat_id)
		})
	res.sendStatus(200)
})

let PORT = process.env.PORT || 8083
const server = app.listen( PORT, () => {
	console.log(`Server successfully running on port ${PORT}...`)
})