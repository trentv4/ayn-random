let commands = {
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
	}
}

module.exports = commands