const Discord = require('discord.js');
const client = new Discord.Client();
const { MessageAttachment } = require('discord.js');
const { CaptchaGenerator } = require('captcha-canvas');
const fs = require('fs');





// invite:  https://discord.com/api/oauth2/authorize?client_id=774699098112524351&permissions=8&scope=bot

client.on('ready', () => {
    console.log("Bot Online")
});

client.on('guildCreate', async guild => {
    console.log('Joined guild: ' + guild.name);

    await guild.roles.create({
        data: {
            name: 'unverified',
            color: 'BLUE',
            permissions: []
        },
        reason: 'Made by captcha bot for unverified people. DO NOT CHANGE THIS ROLES NAME'
    })
    console.log('Created role.')

    let everyonerole = guild.roles.everyone

    let role = guild.roles.cache.find(r => r.name === "unverified");


    guild.channels.cache.forEach(async (channel) => {
        channel.updateOverwrite(role, { VIEW_CHANNEL: false });
    });

    guild.channels.create('captcha', {
        type: 'text',
        permissionOverwrites: [
            {
                id: everyonerole.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: role.id,
                allow: ['VIEW_CHANNEL'],
            }
        ],
    });



})
client.on("message", msg => {
    if (msg.author.bot) return;
    async function clear() {
        msg.delete();
        const fetched = await msg.channel.messages.fetch({ limit: 99 });
        msg.channel.bulkDelete(fetched);
    }
    clear()
});

client.on('guildMemberAdd', async (member) => {
    console.log('User joined')
    let role = member.guild.roles.cache.find(r => r.name === "unverified");
    member.roles.add(role);
    const cchan = member.guild.channels.cache.find(channel => channel.name === "captcha");

    const captcha = new CaptchaGenerator().setTrace({ size: 3, color: '#6495ed' }).setCaptcha({ color: '#00bfff' });
    const buffer = await captcha.generate();

    const filter = (user) => {
        return user.author.id === member.id;
    };

    console.log(captcha.text);

    fs.writeFileSync('image.png', buffer);
    cchan.send(new MessageAttachment('image.png', 'image.png'));

    cchan
        .awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
        .then((collected) => {
            if (collected.first().content === captcha.text) {
                member.roles.remove(role);
            }
        })
});

client.login('TOKEN')