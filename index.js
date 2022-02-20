const { Collection, Client, Intents, MessageAttachment } = require('discord.js')
const Discord = require('discord.js')
const client = new Client({ disableEveryone: true, intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],})
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./datas/config.json");
module.exports = client;
require("./handler")(client);
client.queue = new Map();

const mongo = require('aurora-mongo')
const ser = new mongo.Database("certification");
client.on('messageCreate', async message => {
    //messageイベント発火
      if (!message.channel.type == "text" || message.author.bot) return;
      //textチャンネル以外とBOTは処理しない
      if (message.content.startsWith("y.setverf")) {
        //メッセージが!登録だった場合
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send('NOADOMIN');
        //権限確認
          const args = message.content.split(" ").slice(1);
            //メッセージのコマンドを抜いた部分を配列にしてargsに代入
          const role = message.mentions.roles.first();
          //メンションされた情報をroleに代入
          if (!args[0]) return message.channel.send("引用がないよ");
          //もしコマンドだけなら
          if (role) {
              //メンションされた場合の処理
               message.member.roles.add(role)
               //メッセージを打った人にロールを与える
               .then(async() => {
                //成功した場合
                  await ser.set(message.guild.id, `${message.channel.id},${role.id}`)
                  //DBにギルドID(key)でチャンネルIDとロールIDを書き出す
                  message.channel.send(`登録が完了しました!!\nロール:${role}\nchannel:${message.channel}`);
                  //完了のメッセージを送る
              })
              .catch(e => message.channel.send(`エラー1:${e.message}`));
              //失敗した場合
          } else {
              //メンション以外
               message.member.roles.add(args)
               //打たれた文字列をメッセージを打った人につける
               .then(async() => {
                 //成功した場合
                  await ser.set(message.guild.id, `${message.channel.id},${args}`)
                  //DBにギルドID(key)でチャンネルIDとロールIDを書き出す
                  message.channel.send(`登録が完了しました!!\nロール:${message.guild.roles.cache.find(role => role.id === args)||"エラー"}\nchannel:${message.channel||"エラー"}`);
                  //完了のメッセージを送るその際ロールIDをギルド内で検索してロールメンションの状態にする
              })
              .catch(e => message.channel.send(`エラー2:${e.message}`));
              //失敗した場合
          }
      }
      if (message.content === "y.del") {
        //打たれたメッセージが!削除の場合
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send('NOADOMIN');
        //権限確認
          const content = await ser.get(message.guild.id);
          //contentにDBから取得した値を代入
          if (!content) return message.channel.send("登録がされていません");
          //もしも何も代入されていなかったら処理しない
          const check = content.split(",");
          //,で区切って配列にする
          await ser.delete(message.guild.id);
          //keyからそのサーバーの情報を消す
          message.channel.send(`情報を削除しました!!\n詳細\nチャンネル:${message.guild.channels.cache.find(channels => channels.id === check[0])}\nロール${message.guild.roles.cache.find(role => role.id === check[1])}`);
          //チャンネルIDとロールIDをギルド内で検索して表示している
      }
      if (message.content === "y.checkverf") {
        //打たれたメッセージが!確認の場合
          const content = await ser.get(message.guild.id);
          //contentにDBから取得した値を代入
          if (!content) return message.channel.send("登録がされていません");
          //もしも何も代入されていなかったら処理しない
          const check = content.split(",");
          //,で区切って配列にする
          message.channel.send(`登録詳細\nチャンネル:${message.guild.channels.cache.find(channels => channels.id === check[0])}\nロール:${message.guild.roles.cache.find(role => role.id === check[1])}`);
          //チャンネルIDとロールIDをギルド内で検索して表示している
      }
      if (message.content === "y.verf") {
          const content = await ser.get(message.guild.id);
          //DBからギルドIDを使ってチャンネルIDとロールIDを取得
          if (!content) return message.channel.send("登録がされていません");
          //取得できなかったら処理しない
          const check = content.split(",");
          //取得した値を,で区切って配列にする
          if (check[0] !== message.channel.id) return;
          //DBからとったチャンネルIDと現在のチャンネルIDがあってるか確かめるあっていなかったら処理しない
          const Canvas = require('canvas');
          //canvas読み込み
          var S = "abcdefghjkmnpqrstuvwxyz23456789"
          //出したい文字列
          var N = 6
          //桁数
          var A = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('');
          //ランダムな英数字を作成

          //ここから下はdocs見て
          let fontSize = 50;
          const applyText = (canvas, text) => {
              const context = canvas.getContext('2d');
              do {
                  context.font = `${fontSize / 2}px serif`;
              } while (context.measureText(text).width > canvas.width - 300);
              return context.font;
          };
          const canvas = Canvas.createCanvas(700, 250);
          const context = canvas.getContext('2d');
          const background = await Canvas.loadImage('https://discordjs.guide/assets/canvas-preview.30c4fe9e.png'); //背景
          context.drawImage(background, 0, 0, canvas.width, canvas.height);
          context.strokeStyle = '#0099ff';
          context.strokeRect(0, 0, canvas.width, canvas.height);
          context.font = `${fontSize}px serif`;
          context.fillStyle = '#ffffff';
          context.fillText(A, canvas.width / 2.5, canvas.height / 1.8);
          context.font = applyText(canvas, message.member.displayName);
          context.fillStyle = '#ffffff';
          context.fillText(`${message.member.displayName}さんの認証コードは`, canvas.width / 2.5, canvas.height / 3.5);
          context.beginPath();
          context.arc(125, 125, 100, 0, Math.PI * 2, true);
          context.closePath();
          context.clip();
          const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
          context.drawImage(avatar, 25, 25, 200, 200);
          context.drawImage(avatar, 25, 0, 200, canvas.height);
          const attachment = new MessageAttachment(canvas.toBuffer(), 'unko.png');
          const main = await message.channel.send({ files: [attachment] });
          //作った画像を送る

          const fel = m => m.author.id == message.author.id
          message.channel.awaitMessages({ fel, max: 1, errors: ['time'] })
          //メッセージをdeltime秒待つ
          .then(collected => {
            //成功した場合
              if (!collected.first()) return message.channel.send("timeout");
              //何も取得されていなかった場合処理しない
              collected.first().delete();
              //取得したメッセージを消す

              if (collected.first().content == A) {
                //取得したメッセージがランダムな英数字と一緒だったら
                  message.member.roles.add(check[1])
                  //メッセージを打った人にロールを付ける
                  .then(() => {
                    //成功した場合
                      message.channel.send("認証成功")
                  })
                  .catch(e => message.channel.send(`エラー4:${e.message}`));
              } else {
                  message.channel.send("認証失敗")
              }
          }).catch(() => message.channel.send(`timeout`));
      }
  })



client.login(require('./datas/config.json').token)