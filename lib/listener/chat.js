client.ev.on('messages.upsert', async(chat) => {
  try {
    if (!Object.keys(chat.messages[0]).includes('message') || !Object.keys(chat.messages[0]).includes('key')) return;
    const msg = await functions.metadataMsg(client, chat.messages[0]);
    if (msg.key.id.length < 20 || msg.key.remoteJid == 'status@broadcast') return;
    if (msg.isGroup) {
      if (!database.group) database.group = {};
      if (!database.group[msg.from]) database.group[msg.from] = {};
      if (database.group[msg.from].mute && !msg.string.toLowerCase().includes(unmute)) return
    }
    if (!(msg.from in client.chats)) client.chats[msg.from] = {}
    if (!("messages" in client.chats[msg.from])) client.chats[msg.from].messages = {}
    client.chats[msg.from].messages[msg.id] = msg
    database.chats = client.chats
    cmd.execute(msg);
  } catch(e) {
    if (!String(e).includes('this.isZero')) {
      console.log(e);
      client.reply(config.ownerNumber[0]+'@s.whatsapp.net', functions.util.format(e));
    }
  }
});