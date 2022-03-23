cmd.on(['promote', 'demote', 'kick', 'add'], ['group'], async(msg, {
  mentionedJid, command, query, prefix, quotedMsg
})=> {
  if (!mentionedJid && !query && !quotedMsg) return client.reply(msg, `Tag Orang, Pesan Atau Cantumkan Nomor Telepon Yang Akan Di ${command[0].toUpperCase()+command.slice(1).toLowerCase()}`)
  let action = command == 'kick' ? 'remove': command
  mentionedJid = (mentionedJid && mentionedJid.length >= 1 ? mentionedJid: void 0) || (query ? query.split(" ").map(tr => isNaN(Number(tr))? Number(tr)+'@s.whatsapp.net': void 0): void 0) || [msg.quotedMsg.sender.jid]
  for (let a of mentionedJid) {
    let data = msg.groupData.participants.find(tr => tr.id.includes(a))
    if (data.admin) {
      if (data.admin == 'superadmin') return client.reply(msg, "Tidak Bisa Meng"+command.toLowerCase()+' Owner Group')
      if (!query || !query.toLowerCase().includes('--force')) {
        if (action == 'remove') {
          client.sendButton(msg, {
            text: "Yang Di Kick Adalah Admin, Yakin Mau Tetap Kick?"
          }, [{
              reply: 'Ya', value: prefix+'kick '+a.split('@')[0]+' --force'
            }])
          continue;
        }
      }
    }
    await functions.delay(500)
    client.groupParticipants(msg.from, [{
      jid: a, action
    }])
  }
  client.reply(msg, `Sukses Meng${command.toLowerCase()} Members ${mentionedJid.map(tr => tr.split('@')[0]).join(', ')}`)
}, {
  group: true,
  admin: true,
  clientAdmin: true,
  wait: true,
  param: functions.needed('participant')
})

cmd.on(['setsubject', 'setdesc', 'setname'], ['group'], async(msg, {
  client, query, command
})=> {
  let action = command == 'setdesc' ? 'groupUpdateDescription': 'groupUpdateSubject'
  let resp = command == 'setdesc' ? 'Deskripsi': 'Nama Grub'
  await client[action](msg.from, query)
  client.reply(msg, `Berhasil Mengedit ${resp} Menjadi ${query}`)
}, {
  group: true,
  admin: true,
  clientAdmin: true,
  wait: true,
  query:true,
  param: functions.needed('query')
})

cmd.on(['setpp', 'setppgc', 'setppgrub'], ['group'], async(msg, {
  client, command, quotedMsg
})=> {
  if (!msg.isMedia && (!msg.quotedMsg || !msg.quotedMsg.isMedia)) return client.reply(msg, `Tag Pesan Atau Kirim Pesan Gambar Yang akan Di Jadikan Pp Grub`)
  let buffer = msg.isMedia ? await msg.downloadMsg(): await msg.quotedMsg.downloadMsg()
  client.updateProfilePicture(msg.from, buffer.buffer).then(t=> client.reply(msg, `Berhasil Mengubah Pp Group`))
}, {
  group: true,
  admin: true,
  clientAdmin: true,
  wait: true,
  param: functions.needed('query')
})


cmd.on(['leave'], ['group'], async(client, {
  from
}) => {
  client.reply(msg, `~Dadah :)`).then(tr => client.groupLeave(from))
}, {
  group: true,
  wait: true,
  admin: true
})

cmd.on(['linkgrub', 'invitecode'], ['group'], async(client, {
  from
}) => {
  client.reply(msg, `Nih https://chat.whatsapp.com/${await client.groupInviteCode(from)}`)
}, {
  group: true,
  clientAdmin: true,
  wait: true,
  admin: true
})

cmd.on(['mute', 'unmute'], ['group'], async(client, {
  from, command
}) => {
  if ((command == 'mute' && database.group[from].mute) || (command == 'unmute' && !database.group[from].mute)) return client.reply(msg, `Sudah ${command == 'mute' ? 'Dimute': 'Tidak Mute'} Gan`)
  let bool = command == 'mute' ? database.group[from].mute = true: database.group[from].mute = false
  client.reply(msg, `Berhasil ${command == 'mute' ? 'Mute': 'Unmute'} Gan`)
}, {
  group: true,
  wait: true,
  admin: true
})

cmd.on(['hidetag', 'ht'], ['group'], async(msg, {
  client, groupData, query
}) => {
  let mentionedJid = groupData.participants.map(tr => tr.id)
  let data = msg.body
  let type = msg.type == 'conversation' || msg.type == 'extendedTextMessage'? data = {
    text: query
  }: data.caption = query
  client.sendMessageFromContent(msg, {[msg.type == 'conversation'?'extendedTextMessage': msg.type]: data
  }, {
    contextInfo: {
      mentionedJid
    }})
}, {
  group: true,
  admin: true,
  query: true,
  param: functions.needed('query')
})

cmd.on(['totag'], ['group'], async(msg, {
  client, groupData
}) => {
  let mentionedJid = groupData.participants.map(tr => tr.id)
  client.sendMessageFromContent(msg, msg.quotedMsg.message, {
    contextInfo: {
      mentionedJid
    }})
}, {
  quoted: true,
  group: true,
  admin: true
})
