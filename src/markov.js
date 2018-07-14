function allowedChannel(name) {
	if(name == "bot_commands" ||
	   name == "guncle-bunker" ||
	   name == "debug" ||
	   name == "some_like_it_bot" ||
	   name == "supersecret") return false
	return true
}

function allowedMimicChannel(name) {
	if(name == "fodder-war-crimes" ||
	   name == "fodder-mein-kampf" ||
	   name == "fodder-random") return false
	return true
}

function rand(max) {
	return Math.floor(Math.random() * max)
}

let allowedAnywhere = true

function getWords(preInput) {
	let input = []
	preInput.forEach(a => {
		let n = a.split(".")
		n.forEach(q => {
			input.push(q)
		})
	})
	let words = {}
	let parsed = {}
	input.forEach(a => {
		let array = a.split(/[\s.]+/)
		for(let i = 0; i < array.length; i++) {
			let word = array[i]
			let nextWord = array[i+1]
			if(words[word] == null) {
				words[word] = {}
				parsed[word] = {
					size: 0,
					nextWords: []
				}
			}

			if(nextWord == undefined) nextWord = "."
			words[word][nextWord] = (words[word][nextWord] == null ? 1 : words[word][nextWord] + 1)
		}
	})

	let wordsKeys = Object.keys(words)
	wordsKeys.forEach(wKey => {
		parsed[wKey].name = wKey

		let nextWordKeys = Object.keys(words[wKey])
		let total = 0
		nextWordKeys.forEach(nwKey => {
			total += total + words[wKey][nwKey]
			let obj = {
				name: nwKey,
				prob: total
			}
			parsed[wKey].nextWords.push(obj)
		})

		parsed[wKey].size = total
	})

	return parsed
}

function markov(source, length) {
	let words = getWords(source)
	let wordsKeys = Object.keys(words)

	let currentWordKey = wordsKeys[rand(wordsKeys.length)]
	let output = ""

	for(let i = 0; i < length; i++) {
		let addition = " " + currentWordKey

		if(i == 0) addition = currentWordKey
		if(i == 0 && currentWordKey == ".") addition = ""
		if(currentWordKey == ".") addition = "."
		if(currentWordKey == "." && output[output.length-1] == "?") addition = ""

		output += addition;
		let currentWord = words[currentWordKey]

		if(currentWordKey == ".") {
			currentWordKey = wordsKeys[rand(wordsKeys.length)]
			continue
		}

		let nextWord = rand(currentWord.size)
		for(let g = 0; g < currentWord.nextWords.length; g++) {
			if(nextWord < currentWord.nextWords[g].prob) {
				currentWordKey = currentWord.nextWords[g].name
				break;
			}
		}
	}

	return output
}

let commands = {
	summary: {
		visible: true,
		exec: (commands, message) => {
			let channel = ""
			try {
				channel = message.mentions.channels.first()
				if(channel == undefined) throw("test")
			} catch(e) {
				message.channel.send("Try again with a REAL channel.")
				return
			}
			if(!allowedAnywhere && message.channel.id != 465351080344027146) {
				message.channel.send("Try it in <#465351080344027146>")
				return
			}
			if(!allowedChannel(channel.name)) return
			channel.fetchMessages({limit: 100}).then(all => {
				let messages = []
				all.forEach(item => {
					if(item.content == "") return
					if(item.content[0] == "!") return
					messages.push(item.content)
				})
				message.channel.send(markov(messages, 30 + rand(30)))
			})
		}
	},
	mimic: {
		visible: true,
		exec: (commands, message) => {
			let target = ""
			if(commands[0] != "all") {
				try {
					target = message.mentions.users.first().id
				} catch(e) {
					message.channel.send("Try again with a REAL name.")
					return
				}
			}
			else {
				target = "all"
			}
			if(!allowedAnywhere && message.channel.id != 465351080344027146) {
				message.channel.send("Try it in <#465351080344027146>")
				return
			}
			let userLogs = []
			let guild = message.channel.guild
			let channels = guild.channels.array()

			let promises = []

			for(let i = 0; i < channels.length; i++) {
				let channel = channels[i]
				if(channel.type != "text") continue
				if(!allowedChannel(channel.name)) continue
				if(!allowedMimicChannel(channel.name)) continue

				promises.push(new Promise((resolve, reject) => {
					channel.fetchMessages({limit: 100}).then(messages => {
						let l = []
						messages.forEach(message => {
							if(target != "all" && message.author.id != target) return
							if(message.content == "") return
							if(message.content[0] == "!") return
							l.push(message.content)
						})
						resolve(l)
					})
				}))
			}

			Promise.all(promises).then(out => {
				let all = []
				for(let i = 0; i < out.length; i++) {
					for(let g = 0; g < out[i].length; g++) {
						all.push(out[i][g])
					}
				}
				message.channel.send(markov(all, 30 + rand(30)))
			})
		}
	}
}

module.exports = commands