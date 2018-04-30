const fs = require("fs")
const client = new (require("discord.js")).Client( { autoReconnect: true } );

const excludedCommands = [
	"skip",
	"play",
	"volume",
	"request"
]

let rigged = ""

// List of pre-written commands that do something more technical than a in-out response
const commandList = {
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
				message.channel.sendMessage("No, give me less than that.")
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
						message.channel.sendMessage("No, no more than 50 dice at a time.")
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

			message.channel.sendMessage(string)

			return true
		}
	},
	set_name: {
		visible: true,
		exec: (commands, message) => {
			let newName = message.content.replace("!set_name ", "")
			if(newName != null)
			{
				message.guild.members.get(client.user.id).setNickname(newName)
				message.channel.sendMessage("Nickname set to: " + newName)
			}
		}
	},
	set_avatar: {
		visible: true,
		exec: (commands, message) => {
			try {
				client.user.setAvatar(commands[0]).then(user => {
					message.channel.sendMessage("Avatar set! Beware, you can only do this a few times every so often.")
				})
			} catch(e) {console.log(e)}
		}
	},
	create_response: {
		visible: true,
		exec: (commands, message) => {
			let mess = {
				trigger: commands[0],
				response: commands.slice(1).join(" ")
			}
			if(mess.trigger != null && mess.trigger.length > 0)
			{
				responseMessages.push(mess)
				message.channel.sendMessage("Command created.")
				fs.writeFileSync("responses.json", JSON.stringify(responseMessages))
			}
		}
	},
	remove_response: {
		visible: true,
		exec: (commands, message) => {
			let newMessages = []
			for(let i = 0; i < responseMessages.length; i++)
			{
				if(responseMessages[i].trigger != commands[0])
				{
					newMessages.push(responseMessages[i])
				}
			}
			message.channel.sendMessage("Command removed (if it existed).")
			responseMessages = newMessages;
			fs.writeFileSync("responses.json", JSON.stringify(responseMessages))
		}
	},
	login: {
		visible: false,
		exec: (commands, message) => {
			connect()
		}
	},
	commands: {
		visible: true,
		exec: (commands, message) => {
			let m = []
			for(let i = 0; i < responseMessages.length; i++)
			{
				m.push(responseMessages[i].trigger)
			}
			let g = []
			let gt = Object.keys(commandList);
			for(let i = 0; i < gt.length; i++)
			{
				if(commandList[gt[i]].visible)
				{
					g.push(gt[i])
				}
			}

			let string = ""
			string += "Responses: \n" + m.join(", ") + "\n"
			string += "Commands: \n" + g.join(", ")
			message.channel.sendMessage(string)
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
			message.channel.sendMessage(response)
		}
	}
}

// If any messages contain a term in this file (the trigger), it'll shout the response
let responseMessages = []

if(fs.existsSync("responses.json")) responseMessages = JSON.parse(fs.readFileSync("responses.json", "utf-8"))

// This is console.log without the \n at the end.
console.write = (message) => {
	process.stdout.write(message);
}

console.log("Connecting...");
client.login(fs.readFileSync("token.txt", "utf-8").replace(/\r?\n|\r/g, ''));

client.on("ready", () => {
	console.log("Ayn Random is now connected");
})

client.on("message", m => {
	if(m.author.id == client.user.id) return;

	let lowerCase = m.content.toLowerCase();

	for(let i = 0; i < responseMessages.length; i++)
	{
		if(lowerCase.includes(responseMessages[i].trigger) && !lowerCase.includes("!remove_response"))
		{
			m.channel.sendMessage(responseMessages[i].response)
		}
	}

	if(m.content[0] != "!") return;

	let command = m.content.substring(1, m.content.length).split(" ");

	if(excludedCommands.includes(command[0])) return

	console.write("Running command by " + getUsername(m) + ": " + m.content + "   ")
	if(commandList[command[0]] != null)
	{
		commandList[command[0]].exec(command.splice(1), m)
	}
	console.write("\n")
})

// Handle all incoming messages

function getUsername(message)
{
	let trueUsername = message.author.username;
	let nickName = message.guild.members.get(message.author.id).nickname
	if(nickName != null) return nickName;
	return trueUsername;
}
