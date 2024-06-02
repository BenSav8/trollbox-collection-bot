const io = require('socket.io-client')
const socket = io("https://www.windows93.net:8086", {
    forceNew: true,
    transportOptions: {
        polling: {
            extraHeaders: {
                "Accept": "*/*",
                "Accept-Encoding": "identity",
                "Accept-Language": "*",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Cookie": "",
                "Host": "www.windows93.net",
                "Origin": "http://www.windows93.net",
                "Pragma": "no-cache",
                "Referer": 'http://www.windows93.net/trollbox/index.php',
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
            }
        }
    }
});

socket.emit('user joined', 'CollectionTemp [coll!]', 'dodgerblue;owo', '', '')

const _ = require('lodash')
const fs = require('fs')

const cooldowns = {}
function checkCooldown(specific, time) {
    return !cooldowns[specific] || (Date.now() - cooldowns[specific]) >= time
}

function updateCooldown(specific) {
    cooldowns[specific] = Date.now()
}

function getCooldownTimeLeft(specific, time) {
    if (!cooldowns[specific]) {
        return 0
    }
    const timepassed = Date.now() - cooldowns[specific]
    const timeleft = time - timepassed
    return timeleft > 0 ? timeleft : 0
}

function setJSONFile(path, content) {
	fs.writeFileSync(path, JSON.stringify(content))
}

function addCollectionData(object, layone, laytwo) {
  if (_.has(object, layone)) {
    object[layone].push(laytwo)
  } else {
    _.set(object, layone, [laytwo])
  }
}

const colls = require('./collectables.json')
let saveData = require('./collectdata.json')

socket.on("message", function (data) {
	if (data.msg.toLowerCase().match(/^coll!help(\s|$)/)) {
		socket.send('This is a collection bot template by BenSav, collection command is coll!collect, dex command is coll!dex and lookup command is coll!lookup')
	}
	if (data.msg.toLowerCase().match(/^coll!collect(\s|$)/)) {
		if (checkCooldown('coll' + data.home, 180000)) {
			let obtained = _.sample(colls.coll)
			updateCooldown('coll' + data.home)
			if (!saveData.hasOwnProperty(data.home) || !saveData[data.home].includes(obtained)) {
				addCollectionData(saveData, data.home, obtained)
				setJSONFile('./collectdata.json', saveData)
				socket.send('You got ' + obtained)
			} else {
				socket.send('You already obtained ' + obtained)
			}
		} else {
			socket.send(Math.floor(getCooldownTimeLeft('coll' + data.home, 180000) / 1000) + ' seconds left')
		}
	}
	if (data.msg.toLowerCase().match(/^coll!dex(?:\s(.*))?$/i)) {
		let chosenHome
		if (data.msg.toLowerCase().match(/^coll!dex(?:\s(.*))?$/i)[1]) {
			chosenHome = data.msg.match(/^coll!dex(?:\s(.*))?$/i)[1]
		} else {
			chosenHome = data.home
		}
		if (_.has(saveData, [chosenHome])) {
			socket.send('The person has ' + _.size(_.get(saveData, [chosenHome])) + '/' + _.size(colls.coll) + ' items')
		} else {
			socket.send('Home not found in savefile')
		}
	}
	if (data.msg.toLowerCase().match(/^coll!lookup(?:\s(.*))?$/i)) {
		if (data.msg.toLowerCase().match(/^coll!lookup(?:\s(.*))?$/i)[1]) {
			let lookuptarget = data.msg.match(/^coll!lookup(?:\s(.*))?$/i)[1]
			if (_.includes(colls.coll, lookuptarget)) {
				if (_.includes(saveData[data.home], lookuptarget)) {
					socket.send('You have this item')
				} else {
					socket.send('You do not have this item')
				}
			} else {
				socket.send('Not a valid item')
			}
		} else {
			socket.send('What are you looking for?')
		}
	}
})
