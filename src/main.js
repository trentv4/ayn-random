const fs = require("fs")
const client = new (require("discord.js")).Client( { autoReconnect: true } );

const excludedCommands = [
	"skip",
	"play",
	"volume",
	"request"
]

// List of pre-written commands that do something more technical than a in-out response
const commandList = {
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
				message.channel.send("Command created.")
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
			message.channel.send("Command removed (if it existed).")
			responseMessages = newMessages;
			fs.writeFileSync("responses.json", JSON.stringify(responseMessages))
		}
	},
	commands: {
		visible: true,
		exec: (commands, message) => {
			let responses = []
			responseMessages.forEach(resp => responses.push(resp.trigger))

			let visibleCommands = []
			Object.keys(commandList).forEach(command => { 
				if(commandList[command].visible) visibleCommands.push(command)
			})

			let string = ""
			string += "**Responses**: \n" + responses.join(", ") + "\n"
			string += "**Commands**: \n" + visibleCommands.join(", ")
			message.channel.send(string)
		}
	},
	apply: (target) => {
		let methods = Object.keys(target)
		methods.forEach(i => {
			commandList[i] = target[i]
		})
	}
}

commandList.apply(require(__dirname + "/bot-management.js"))
commandList.apply(require(__dirname + "/markov.js"))
commandList.apply(require(__dirname + "/dice.js"))

// If any messages contain a term in this file (the trigger), it'll shout the response
let responseMessages = []

if(fs.existsSync("responses.json")) responseMessages = JSON.parse(fs.readFileSync("responses.json", "utf-8"))

// This is console.log without the \n at the end.
console.write = (message) => {
	process.stdout.write(message);
}

console.log("Connecting...");
client.login(fs.readFileSync("token.txt", "utf-8").replace(/\r?\n|\r/g, ''));

client.on('error', console.error)

client.on("ready", () => {
	console.log("Ayn Random is now connected");
})

// Handle all incoming messages

client.on("message", m => {
	if(m.author.id == client.user.id) return;

	let lowerCase = m.content.toLowerCase();

	for(let i = 0; i < responseMessages.length; i++)
	{
		if(lowerCase.includes(responseMessages[i].trigger) && !lowerCase.includes("!remove_response"))
		{
			m.channel.send(responseMessages[i].response)
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

function getUsername(message)
{
	let trueUsername = message.author.username;
	let nickName = message.guild.members.get(message.author.id).nickname
	if(nickName != null) return nickName;
	return trueUsername;
}
