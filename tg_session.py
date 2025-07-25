from telethon.sync import TelegramClient
from telethon.sessions import StringSession
api_id = '27817382'
api_hash = '888932130b16a6a3a31fad5cc7c601f1'
with TelegramClient(StringSession(), api_id, api_hash) as client:
    print(client.session.save())