const markov = require("markovchain")

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
			channel.fetchMessages({limit: 100}).then(all => {
				let messages = []
				all.forEach(item => {
					if(message.content == "") return
					if(item.content[0] == "!") return
					if(message.content.includes("http://")) return
					if(message.content.includes("https://")) return
					messages.push(item.content)
				})
				let chain = new markov(messages.join(" "))
				let startPhrase = messages[Math.floor(Math.random() * messages.length)].split(" ")[0]
				let length = Math.floor((Math.random() * 20) + 60)
				message.channel.send(chain.start(startPhrase).end(length).process())
			})
		}
	},
	mimic: {
		visible: true,
		exec: (commands, message) => {
			let target = ""
			try {
				target = message.mentions.users.first().id
			} catch(e) {
				message.channel.send("Try again with a REAL name.")
				return
			}
			let userLogs = []
			let guild = message.channel.guild
			let channels = guild.channels.array()

			let promises = []

			for(let i = 0; i < channels.length; i++) {
				let channel = channels[i]
				if(channel.type != "text") continue
				if(channel.name == "guncle-bunker" || channel.name == "bots" || channel.name == "bot_commands") continue

				promises.push(new Promise((resolve, reject) => {
					channel.fetchMessages({limit: 100}).then(messages => {
						let l = []
						messages.forEach(message => {
							if(message.author.id != target) return
							if(message.content == "") return
							if(message.content[0] == "!") return
							if(message.content.includes("http://")) return
							if(message.content.includes("https://")) return
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
				let chain = new markov(all.join(" "))
				message.channel.send(chain.start(all[Math.floor(Math.random() * all.length)].split(" ")[0]).end((Math.random() * 10) + 20).process())
			})
		}
	}
}

module.exports = commands