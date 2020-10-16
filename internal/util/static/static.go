package static

import "github.com/bwmarrin/discordgo"

const (
	InvitePermission = 0x1 | // CREATE INSTANT INVITE
		0x10 | // MANAGE CHANNELS
		0x20 | // MANAGE GUILD
		0x40 | // ADD REACTIONS
		0x400 | // VIEW CHANNEL
		0x800 | // SEND MESSAGES
		0x2000 | // MANAGE MESSAGES
		0x4000 | // EMBED LINKS
		0x8000 | // ATTACH FILES
		0x10000 | // READ MESSAGE HISTORY
		0x20000 | // MENTION @everyone
		0x40000 | // USE EXTERNAL EMOJIS
		0x4000000 | // CHANGE NICKNAMES
		0x8000000 | // MANAGE NICKNAMES
		0x10000000 | // MANAGE ROLES
		0x20000000 | // MANAGE WEBHOOKS
		0x40000000 // MANAGE EMOJIS

	Intents = discordgo.IntentsDirectMessages |
		discordgo.IntentsGuildBans |
		discordgo.IntentsGuildEmojis |
		discordgo.IntentsGuildIntegrations |
		discordgo.IntentsGuildInvites |
		discordgo.IntentsGuildMembers |
		discordgo.IntentsGuildMessageReactions |
		discordgo.IntentsGuildMessages |
		discordgo.IntentsGuildPresences |
		discordgo.IntentsGuildVoiceStates |
		discordgo.IntentsGuilds |
		discordgo.IntentsGuildVoiceStates

	ConfigVersion = 6

	ColorEmbedError   = 0xd32f2f
	ColorEmbedDefault = 0xffc107
	ColorEmbedUpdated = 0x8bc34a
	ColorEmbedGray    = 0xb0bec5
	ColorEmbedOrange  = 0xfb8c00
	ColorEmbedGreen   = 0x8BC34A
	ColorEmbedCyan    = 0x00BCD4
	ColorEmbedYellow  = 0xFFC107
	ColorEmbedViolett = 0x6A1B9A

	ReportRevokedColor = 0x9C27B0

	AutoNick  = "シンプル"
	StdMotd   = "github.com/zekroTJA/shinpuru"
	DefEpoche = 1545834736 // 2018-12-26 15:32:16 +0100 CET

	MutedRoleName = "shinpuru-muted"

	SettingPresence        = "PRESENCE"
	SettingWIInviteGuildID = "WIINVITEGUILDID"
	SettingWIInviteCode    = "WIINVITECODE"
	SettingWIInviteText    = "WIINVITETEXT"

	StorageBucketImages  = "shinpuru-images"
	StorageBucketBackups = "shinpuru-backups"

	DiscordAPIEndpoint = "https://discord.com/api"

	CommandManualDocument = "https://github.com/zekroTJA/shinpuru/wiki/Commands"
)

var (
	PermLvlBotOwner   = 1000
	PermLvlGuildOwner = 10

	ReportTypesReserved = 3
	ReportTypes         = []string{
		"KICK",
		"BAN",
		"MUTE",
		"WARN",
		"AD",
	}

	ReportColors = []int{
		0xD81B60,
		0xe53935,
		0x009688,
		0xFB8C00,
		0x8E24AA,
	}

	DefaultAdminRules = []string{
		"+sp.guild.*",
		"+sp.etc.*",
		"+sp.chat.*",
	}

	DefaultUserRules = []string{
		"+sp.etc.*",
		"+sp.chat.*",
	}

	AdditionalPermissions = []string{
		"sp.guild.config.karma",
	}
)
