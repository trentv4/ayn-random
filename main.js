const fs = require("fs")

const client = new (require("discord.js")).Client();

const excludedCommands = [
	"skip",
	"play",
	"volume"
]

// List of pre-written commands that do something more technical than a in-out response 
const commandList = {
	roll: (commands, message) => {
		if(commands.length > 20)
		{
			message.channel.sendMessage("No, give me less than that.")
			return
		}

		let totalRaw = []
		let totalModified = 0
		let validCommands = []

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

				validCommands.push(value)

				let rollTotal = 0
				for(let i = 0; i < diceCount; i++)
				{
					rollTotal += Math.ceil(Math.random() * diceType)
				}

				totalRaw.push(rollTotal)
				totalModified += rollTotal + diceAdd;

			} catch(e) {}
		})

		let string = ""
		string += "**" 
		string += message.guild.members.get(message.author.id).nickname
		string += "**" 
		string += ": rolling "
		string += validCommands.join(", ")
		string += ": got "
		string += "**" + totalModified + "**"
		string += " ("
		string += totalRaw.join(", ")
		string += " natural)"

		console.write(totalModified + " rolled, " + totalRaw.join(", ") + " natural")

		message.channel.sendMessage(string)

		return true
	},
	set_name: (commands, message) => {
		let newName = message.content.replace("!set_name ", "")
		if(newName != null)
		{
			message.guild.members.get(client.user.id).setNickname(newName)
			message.channel.sendMessage("Nickname set to: " + newName)
		}
	},
	set_avatar: (commands, message) => {
		try {
			client.user.setAvatar(commands[0]).then(user => {
				message.channel.sendMessage("Avatar set! Beware, you can only do this a few times every so often.")
			})
		} catch(e) {console.log(e)}
	},
	create_response: (commands, message) => {
		let mess = {
			trigger: commands[0],
			response: commands.slice(1).join(" ")
		}
		responseMessages.push(mess)
		message.channel.sendMessage("Command created.")		
		fs.writeFileSync("responses.json", JSON.stringify(responseMessages))
	},
	remove_response: (commands, message) => {
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
	},
	commands: (commands, message) => {
		let m = []
		for(let i = 0; i < responseMessages.length; i++)
		{
			m.push(responseMessages[i].trigger)
		}
		let string = ""
		string += "Responses: \n" + m.join(", ") + "\n"
		string += "Commands: \n" + Object.keys(commandList).join(", ")
		message.channel.sendMessage(string)
	},
}

// If any messages contain a term in this file (the trigger), it'll shout the response
let responseMessages = []

if(fs.existsSync("responses.json")) responseMessages = JSON.parse(fs.readFileSync("responses.json", "utf-8"))

// This is console.log without the \n at the end.
console.write = (message) => {
	process.stdout.write(message);
}

client.login(fs.readFileSync("token.txt", "utf-8"));
client.on("ready", () => {
	console.log("Ayn Random is now running");
})

// Handle all incoming messages
client.on("message", m => {
	if(m.author.id == client.user.id) return;

	let lowerCase = m.content.toLowerCase();

	for(let i = 0; i < responseMessages.length; i++)
	{
		if(lowerCase.includes(responseMessages[i].trigger))
		{
			m.channel.sendMessage(responseMessages[i].response)
		}
	}

	if(m.content[0] != "!") return;

	let command = m.content.substring(1, m.content.length).split(" ");

	if(excludedCommands.includes(command[0])) return

	console.write("Running command by " + m.author.username + ": " + m.content + "   ")
	if(commandList[command[0]] != null)
	{
		commandList[command[0]](command.splice(1), m)
	}
	console.write("\n")
})
