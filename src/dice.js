let rigged = ""

function getUsername(message)
{
	let trueUsername = message.author.username;
	let nickName = message.guild.members.get(message.author.id).nickname
	if(nickName != null) return nickName;
	return trueUsername;
}

let commands = {
	rig: {
		visible: false,
		exec: (commands, message) => {
			if(commands.length != 1) return;

			rigged = commands[0]
		}
	},
	roll: {
		visible: true,
		exec: (commands, message) => {
			if(commands.length > 20)
			{
				message.channel.send("No, give me less than that.")
				return
			}

			let totalRaw = []
			let totalModified = 0
			let validCommandsRaw = []
			let validCommands = []

			if(commands.length == 0) {
				commands.push("1d20")               
			}

			commands.forEach((value, index, array) => {
				try {
					let diceCount = parseInt(value.split("d")[0])
					let diceType = 0;
					let diceAdd = 0;

					if(diceCount > 50)
					{
						message.channel.send("No, no more than 50 dice at a time.")
						return;
					}

					if(value.includes("+"))
					{
						let split = value.split("d")[1].split("+");
						diceType = parseInt(split[0])
						diceAdd = parseInt(split[1])
					} else if(value.includes("-"))
					{
						let split = value.split("d")[1].split("-");
						diceType = parseInt(split[0])
						diceAdd = -1 * parseInt(split[1])
					} else
					{
						diceType = parseInt(value.split("d")[1])
					}

					validCommandsRaw.push(value)

					validCommands.push({
						count: diceCount,
						type: diceType,
						bonus: diceAdd
					})
				} catch(e) {}
			})

			for(let i = 0; i < validCommands.length; i++)
			{
				let cmd = validCommands[i]
				let total = 0
				for(let g = 0; g < cmd.count; g++) 
				{
					let parsed = parseInt(rigged)
					if(!isNaN(parsed) & parsed <= cmd.type)
					{
						total += parsed
						rigged = ""
					}
					else if(rigged == "max")
					{
						total += cmd.type
						rigged = ""
					}
					else if(rigged == "min")
					{
						total += 1
						rigged = ""
					}
					else
					{
						total += Math.ceil(Math.random() * cmd.type)
					}
				}
				totalRaw.push(total)
				totalModified += (total + cmd.bonus)
			}

			let string = ""
			string += "**"
			string += getUsername(message)
			string += "**"
			string += ": rolling "
			string += validCommandsRaw.join(", ")
			string += ": got "
			string += "**" + totalModified + "**"
			string += " ("
			string += totalRaw.join(", ")
			string += " natural)"

			console.write(totalModified + " rolled, " + totalRaw.join(", ") + " natural")

			message.channel.send(string)
			message.delete()

			return true
		}
	},
	deck: {
		visible: true,
		exec: (commands, message) => {
			let cards = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"]
			let suits = ["diamonds", "spades", "clubs", "hearts"]
			let response = ""
			response += getUsername(message)
			response += " drew the "
			response += cards[Math.floor(Math.random()*cards.length)]
			response += " of "
			response += suits[Math.floor(Math.random()*suits.length)]
			response += "."
			console.write(response)
			message.channel.send(response)
		}
	}
}

module.exports = commands